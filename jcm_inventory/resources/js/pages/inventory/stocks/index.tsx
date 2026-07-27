import { AppDrawer } from '@/components/shared/app-drawer';
import { AppDrawerActions } from '@/components/shared/app-drawer-actions';
import { AppPagination } from '@/components/shared/app-pagination';
import { CalloutCard } from '@/components/shared/callout-card';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { ContextCard } from '@/components/shared/context-card';
import { EntityAvatar } from '@/components/shared/entity-avatar';
import { EntityInfo } from '@/components/shared/entity-info';
import { FilterBar } from '@/components/shared/filter-bar';
import { FormField } from '@/components/shared/form-field';
import { FormSection } from '@/components/shared/form-section';
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
    CheckCircle2,
    CircleDollarSign,
    ClipboardPenLine,
    Eye,
    FileSpreadsheet,
    FileText,
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
    type ReactNode,
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
    batch_tracking_enabled: boolean;
    batch_issue_policy: 'fifo' | 'fefo' | 'manual';
    requires_expiration_date: boolean;
    expiry_warning_days: number | null;
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
    selling_price?: string | number | null;
    stock_tracking: 'tracked' | 'not_tracked';
    batch_tracking_enabled: boolean;
    batch_issue_policy: 'fifo' | 'fefo' | 'manual';
    requires_expiration_date: boolean;
    expiry_warning_days: number | null;
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


type BatchStock = {
    warehouse_batch_stock_id: number;
    stock_batch_id: number;
    batch_code: string;
    lot_number: string | null;
    source_type: string | null;
    source_reference: string | null;
    received_date: string | null;
    manufactured_date: string | null;
    expiration_date: string | null;
    unit_cost: string | number;
    original_quantity: string | number;
    batch_status: string;
    quantity: string | number;
    batch_value: string | number;
    last_movement_at: string | null;
    days_to_expiry: number | null;
    expiry_state: string | null;
};

type BatchAllocationForm = {
    stock_batch_id: string;
    quantity: string;
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
    batch_stocks: BatchStock[];
    batch_count: number;
    batch_quantity: string | number;
    reconciliation_difference: string | number;
    is_reconciled: boolean;
    expiring_batch_count: number;
    expired_batch_count: number;
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
    active_batches: number;
    expiring_batches: number;
    expired_batches: number;
    reconciliation_mismatches: number;
};

type StockFilters = {
    search: string;
    status: string;
    batch_status: string;
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
    positionKeys: string[];
    batchSettings: {
        batch_code_prefix: string;
        batch_code_sequence_padding: number;
        auto_generate_batch_code: boolean;
        default_batch_issue_policy: string;
        expiry_warning_days: number;
        expiry_critical_days: number;
    };
    overviewDetails: Record<string, unknown>;
};

type CreateStockForm = {
    warehouse_id: string;
    product_id: string;
    opening_quantity: string;
    reorder_level: string;
    max_stock_level: string;
    unit_cost: string;
    batch_code: string;
    lot_number: string;
    received_date: string;
    manufactured_date: string;
    expiration_date: string;
    batch_notes: string;
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
    batch_code: string;
    lot_number: string;
    received_date: string;
    manufactured_date: string;
    expiration_date: string;
    batch_notes: string;
    batch_allocations: BatchAllocationForm[];
    remarks: string;
};

type TransferStockForm = {
    to_warehouse_id: string;
    quantity: string;
    reference_no: string;
    batch_allocations: BatchAllocationForm[];
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

type StockInsightView =
    | 'valuation'
    | 'positions'
    | 'quantity'
    | 'active_batches'
    | 'expiring'
    | 'low_stock'
    | 'out_of_stock'
    | 'health';

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
    batch_code: '',
    lot_number: '',
    received_date: '',
    manufactured_date: '',
    expiration_date: '',
    batch_notes: '',
    batch_allocations: [],
    remarks: '',
};

const emptyTransferForm: TransferStockForm = {
    to_warehouse_id: '',
    quantity: '',
    reference_no: '',
    batch_allocations: [],
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
        batch_code: '',
        lot_number: '',
        received_date: '',
        manufactured_date: '',
        expiration_date: '',
        batch_notes: '',
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

    const [detailsStock, setDetailsStock] =
        useState<WarehouseStock | null>(null);

    const [stockInsightView, setStockInsightView] =
        useState<StockInsightView | null>(null);

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

    const [batchStatus, setBatchStatus] = useState(
        filters.batch_status ?? '',
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
        setBatchStatus(filters.batch_status ?? '');

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
        filters.batch_status,
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

    const selectedCreateProduct = useMemo(
        () =>
            products.find(
                (product) =>
                    String(product.id) ===
                    createForm.data.product_id,
            ) ?? null,
        [createForm.data.product_id, products],
    );

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


    const reportQueryString = useMemo(() => {
        const query = new URLSearchParams();

        if (search.trim()) {
            query.set('search', search.trim());
        }

        if (status) {
            query.set('status', status);
        }

        if (batchStatus) {
            query.set('batch_status', batchStatus);
        }

        if (branchId) {
            query.set('branch_id', branchId);
        }

        if (warehouseId) {
            query.set('warehouse_id', warehouseId);
        }

        if (categoryId) {
            query.set('category_id', categoryId);
        }

        const value = query.toString();

        return value ? `?${value}` : '';
    }, [
        search,
        status,
        batchStatus,
        branchId,
        warehouseId,
        categoryId,
    ]);

    const stockPdfUrl =
        `/reports/inventory/stocks/pdf${reportQueryString}`;

    const stockExcelPreviewUrl =
        `/reports/inventory/stocks/excel-preview${reportQueryString}`;

    const stockExcelUrl =
        `/reports/inventory/stocks/excel${reportQueryString}`;

    function openStockReport(url: string): void {
        if (stocks.total === 0) {
            return;
        }

        const reportWindow = window.open(
            url,
            '_blank',
            'noopener,noreferrer',
        );

        if (reportWindow) {
            reportWindow.opener = null;
        }
    }

    function openDetailsDrawer(
        stock: WarehouseStock,
    ): void {
        setDetailsStock(stock);
    }

    function closeDetailsDrawer(): void {
        setDetailsStock(null);
    }

    function openStockInsight(
        view: StockInsightView,
    ): void {
        setStockInsightView(view);
    }

    function closeStockInsight(): void {
        setStockInsightView(null);
    }

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
        setDetailsStock(null);
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
        setDetailsStock(null);
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
        setDetailsStock(null);
        setSelectedStock(stock);

        adjustForm.clearErrors();

        adjustForm.setData({
            movement_type: 'stock_in',
            quantity: '',
            unit_cost: String(
                stock.average_cost ?? '',
            ),
            reference_no: '',
            batch_code: '',
            lot_number: '',
            received_date: '',
            manufactured_date: '',
            expiration_date: '',
            batch_notes: '',
            batch_allocations: [],
            remarks: '',
        });

        setDrawerType('adjust');
    }

    function openTransferDrawer(
        stock: WarehouseStock,
    ): void {
        setDetailsStock(null);
        setSelectedStock(stock);

        transferForm.clearErrors();

        const firstDestination =
            warehouses.find(
                (warehouse) =>
                    warehouse.id !==
                    stock.warehouse_id,
            );

        transferForm.setData({
            to_warehouse_id:
                firstDestination
                    ? String(firstDestination.id)
                    : '',
            quantity: '',
            reference_no: '',
            batch_allocations: [],
            remarks: '',
        });

        setDrawerType('transfer');
    }

    function updateAdjustmentAllocation(
        stockBatchId: number,
        value: string,
    ): void {
        const allocations = adjustForm.data.batch_allocations.filter(
            (allocation) =>
                allocation.stock_batch_id !== String(stockBatchId),
        );

        if (value !== '') {
            allocations.push({
                stock_batch_id: String(stockBatchId),
                quantity: value,
            });
        }

        adjustForm.setData('batch_allocations', allocations);
    }

    function updateTransferAllocation(
        stockBatchId: number,
        value: string,
    ): void {
        const allocations = transferForm.data.batch_allocations.filter(
            (allocation) =>
                allocation.stock_batch_id !== String(stockBatchId),
        );

        if (value !== '') {
            allocations.push({
                stock_batch_id: String(stockBatchId),
                quantity: value,
            });
        }

        transferForm.setData('batch_allocations', allocations);
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
        createForm.clearErrors();

        if (
            selectedCreateProduct?.batch_tracking_enabled &&
            selectedCreateProduct.requires_expiration_date &&
            Number(createForm.data.opening_quantity || 0) > 0 &&
            !createForm.data.expiration_date
        ) {
            createForm.setError(
                'expiration_date',
                'Expiration date is required for this batch-tracked product.',
            );
            return;
        }

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

        adjustForm.clearErrors();

        if (
            selectedStock.product?.batch_tracking_enabled &&
            isIncomingMovement &&
            selectedStock.product.requires_expiration_date &&
            !adjustForm.data.expiration_date
        ) {
            adjustForm.setError(
                'expiration_date',
                'Expiration date is required for this product.',
            );
            return;
        }

        if (
            selectedStock.product?.batch_tracking_enabled &&
            !isIncomingMovement &&
            selectedStock.product.batch_issue_policy === 'manual'
        ) {
            const requested = Number(adjustForm.data.quantity || 0);
            const allocated = adjustForm.data.batch_allocations.reduce(
                (total, allocation) =>
                    total + Number(allocation.quantity || 0),
                0,
            );

            if (Math.abs(requested - allocated) > 0.0001) {
                adjustForm.setError(
                    'batch_allocations',
                    'Manual batch allocation must equal the adjustment quantity.',
                );
                return;
            }
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

        transferForm.clearErrors();

        if (
            selectedStock.product?.batch_tracking_enabled &&
            selectedStock.product.batch_issue_policy === 'manual'
        ) {
            const requested = Number(transferForm.data.quantity || 0);
            const allocated = transferForm.data.batch_allocations.reduce(
                (total, allocation) =>
                    total + Number(allocation.quantity || 0),
                0,
            );

            if (Math.abs(requested - allocated) > 0.0001) {
                transferForm.setError(
                    'batch_allocations',
                    'Manual batch allocation must equal the transfer quantity.',
                );
                return;
            }
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
                batch_status: batchStatus || undefined,
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
        setBatchStatus('');
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
            batchStatus ||
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

                {(summary.reconciliation_mismatches > 0 || summary.expired_batches > 0) && (
                    <CalloutCard
                        tone={summary.reconciliation_mismatches > 0 ? 'danger' : 'warning'}
                        icon={TriangleAlert}
                        title={
                            summary.reconciliation_mismatches > 0
                                ? 'Batch reconciliation requires attention'
                                : 'Expired stock batches detected'
                        }
                        description={
                            summary.reconciliation_mismatches > 0
                                ? `${summary.reconciliation_mismatches} inventory position${summary.reconciliation_mismatches === 1 ? '' : 's'} do not match their exact batch balances.`
                                : `${summary.expired_batches} active batch${summary.expired_batches === 1 ? '' : 'es'} are already expired and should be reviewed.`
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
                            <button
                                type="button"
                                onClick={() => openStockInsight('health')}
                                className={cn(
                                    'inline-flex h-7 w-fit items-center gap-1.5 rounded-full border px-2.5 text-[9px] font-semibold transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/35',
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
                            </button>

                            <Button
                                type="button"
                                disabled={!requirementsComplete}
                                onClick={openCreateDrawer}
                                className="h-9 rounded-lg px-3.5 text-xs"
                            >
                                <Plus className="size-3.5" />
                                Add Stocks
                            </Button>
                        </div>
                    </div>

                    <div className="grid min-w-0 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
                        <button
                            type="button"
                            onClick={() => openStockInsight('valuation')}
                            className="relative overflow-hidden border-b border-border/60 p-4 text-left transition-colors hover:bg-primary/[0.025] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/35 xl:border-b-0 xl:border-r md:p-5"
                        >
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
                        </button>

                        <div className="grid min-w-0 grid-cols-2 lg:grid-cols-3 xl:grid-cols-2">
                            <StockControlMetric
                                title="Inventory Positions"
                                value={formatNumber(summary.records)}
                                description="Product and warehouse pairs"
                                icon={Layers3}
                                tone="primary"
                                onClick={() => openStockInsight('positions')}
                                className="border-b border-r border-border/60"
                            />

                            <StockControlMetric
                                title="Available Quantity"
                                value={formatQuantity(summary.total_quantity)}
                                description="Combined units on hand"
                                icon={Boxes}
                                tone="primary"
                                onClick={() => openStockInsight('quantity')}
                                className="border-b border-border/60 lg:border-r xl:border-r-0"
                            />

                            <StockControlMetric
                                title="Active Batches"
                                value={formatNumber(summary.active_batches)}
                                description="Usable batch cost layers"
                                icon={Layers3}
                                tone="primary"
                                onClick={() => openStockInsight('active_batches')}
                                className="border-b border-r border-border/60 xl:border-b-0"
                            />

                            <StockControlMetric
                                title="Expiring Batches"
                                value={formatNumber(summary.expiring_batches)}
                                description="Within the warning window"
                                icon={TriangleAlert}
                                tone="amber"
                                onClick={() => openStockInsight('expiring')}
                                className="border-b border-border/60 xl:border-b-0"
                            />

                            <StockControlMetric
                                title="Low Stock"
                                value={formatNumber(summary.low_stock)}
                                description="Below replenishment threshold"
                                icon={TriangleAlert}
                                tone="amber"
                                onClick={() => openStockInsight('low_stock')}
                                className="border-r border-border/60"
                            />

                            <StockControlMetric
                                title="Out of Stock"
                                value={formatNumber(summary.out_of_stock)}
                                description="No quantity available"
                                icon={ArrowDownRight}
                                tone="red"
                                onClick={() => openStockInsight('out_of_stock')}
                            />
                        </div>
                    </div>
                </section>

                {/* Inventory position directory */}

                <SectionCard
                    title="Inventory Positions"
                    description="Select any stock row to open its complete warehouse balance, batch layers, thresholds, valuation, and available actions."
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
                                variant="outline"
                                disabled={stocks.total === 0}
                                onClick={() =>
                                    openStockReport(stockPdfUrl)
                                }
                                className="h-9 rounded-lg px-3 text-xs"
                            >
                                <FileText className="size-3.5" />
                                PDF
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                disabled={stocks.total === 0}
                                onClick={() =>
                                    openStockReport(
                                        stockExcelPreviewUrl,
                                    )
                                }
                                className="h-9 rounded-lg px-3 text-xs"
                            >
                                <Eye className="size-3.5" />
                                Excel Preview
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                disabled={stocks.total === 0}
                                onClick={() =>
                                    openStockReport(stockExcelUrl)
                                }
                                className="h-9 rounded-lg px-3 text-xs"
                            >
                                <FileSpreadsheet className="size-3.5" />
                                Excel
                            </Button>

                            <Button
                                type="button"
                                disabled={!requirementsComplete}
                                onClick={openCreateDrawer}
                                className="h-9 rounded-lg px-3.5 text-xs"
                            >
                                <Plus className="size-3.5" />
                                Add Stocks
                            </Button>
                        </div>
                    }
                >
                    <FilterBar
                        onSubmit={applyFilters}
                        contentClassName="grid w-full min-w-0 gap-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-[minmax(240px,1fr)_repeat(5,minmax(130px,0.62fr))]"
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

                        <Select
                            value={batchStatus || ALL_VALUE}
                            onValueChange={(value) =>
                                setBatchStatus(
                                    value === ALL_VALUE ? '' : value,
                                )
                            }
                        >
                            <SelectTrigger className="h-10 w-full text-sm">
                                <SelectValue placeholder="All batch states" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value={ALL_VALUE}>All batch states</SelectItem>
                                <SelectItem value="batch_enabled">Batch tracked</SelectItem>
                                <SelectItem value="standard">Standard stock</SelectItem>
                                <SelectItem value="expiring">Expiring batches</SelectItem>
                                <SelectItem value="expired">Expired batches</SelectItem>
                                <SelectItem value="mismatch">Reconciliation mismatch</SelectItem>
                            </SelectContent>
                        </Select>
                    </FilterBar>

                    <StockDirectoryTable
                        stocks={stocks.data}
                        onSelect={openDetailsDrawer}
                        onCreate={openCreateDrawer}
                        canCreate={requirementsComplete}
                    />

                    <AppPagination
                        pagination={stocks}
                        itemLabel="inventory positions"
                    />
                </SectionCard>
            </PageContainer>

            <StockInsightDrawer
                view={stockInsightView}
                pagination={stocks}
                summary={summary}
                onClose={closeStockInsight}
                onSelect={(stock) => {
                    closeStockInsight();
                    openDetailsDrawer(stock);
                }}
            />

            <StockPositionDetailsDrawer
                stock={detailsStock}
                warehouses={warehouses}
                onClose={closeDetailsDrawer}
                onAdjust={(stock) => {
                    closeDetailsDrawer();
                    openAdjustDrawer(stock);
                }}
                onTransfer={(stock) => {
                    closeDetailsDrawer();
                    openTransferDrawer(stock);
                }}
                onSettings={(stock) => {
                    closeDetailsDrawer();
                    openSettingsDrawer(stock);
                }}
                onDelete={(stock) => {
                    closeDetailsDrawer();
                    requestDelete(stock);
                }}
            />

            {/* Create stock */}

            <AppDrawer
                open={drawerType === 'create'}
                onOpenChange={(open) => {
                    if (!open) {
                        closeDrawer();
                    }
                }}
                title="Add Stocks"
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

                        {selectedCreateProduct?.batch_tracking_enabled &&
                            Number(createForm.data.opening_quantity || 0) > 0 && (
                                <IncomingBatchFields
                                    prefix="opening"
                                    title="Opening Batch Layer"
                                    description="Identify the exact batch or cost layer used for this opening balance."
                                    values={createForm.data}
                                    requiresExpiration={
                                        selectedCreateProduct.requires_expiration_date
                                    }
                                    processing={createForm.processing}
                                    errors={createForm.errors as Record<string, string>}
                                    onChange={(field, value) =>
                                        createForm.setData(field, value)
                                    }
                                />
                            )}

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

                                {selectedStock.product?.batch_tracking_enabled &&
                                    isIncomingMovement && (
                                        <IncomingBatchFields
                                            prefix="adjustment"
                                            title="Incoming Batch Layer"
                                            description="Create the exact batch layer for this incoming adjustment."
                                            values={adjustForm.data}
                                            requiresExpiration={
                                                selectedStock.product.requires_expiration_date
                                            }
                                            processing={adjustForm.processing}
                                            errors={adjustForm.errors as Record<string, string>}
                                            onChange={(field, value) =>
                                                adjustForm.setData(field, value)
                                            }
                                        />
                                    )}

                                {selectedStock.product?.batch_tracking_enabled &&
                                    !isIncomingMovement &&
                                    selectedStock.product.batch_issue_policy === 'manual' && (
                                        <ManualBatchAllocationFields
                                            title="Manual Batch Allocation"
                                            description="Select the exact source batches to reduce for this adjustment."
                                            batches={selectedStock.batch_stocks}
                                            requestedQuantity={adjustForm.data.quantity}
                                            allocations={adjustForm.data.batch_allocations}
                                            processing={adjustForm.processing}
                                            error={(adjustForm.errors as Record<string, string>).batch_allocations}
                                            onChange={updateAdjustmentAllocation}
                                        />
                                    )}

                                {selectedStock.product?.batch_tracking_enabled &&
                                    !isIncomingMovement &&
                                    selectedStock.product.batch_issue_policy !== 'manual' && (
                                        <CalloutCard
                                            tone="info"
                                            icon={Layers3}
                                            title={`${selectedStock.product.batch_issue_policy.toUpperCase()} automatic allocation`}
                                            description="The backend will allocate eligible batches automatically and record the exact cost layers used."
                                        />
                                    )}

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
                                                    .to_warehouse_id,
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
                                    id="to_warehouse_id"
                                    label="Destination Warehouse"
                                    error={
                                        transferForm
                                            .errors
                                            .to_warehouse_id
                                    }
                                    required
                                >
                                    <Select
                                        value={
                                            transferForm
                                                .data
                                                .to_warehouse_id ||
                                            NONE_VALUE
                                        }
                                        disabled={
                                            transferForm.processing
                                        }
                                        onValueChange={(
                                            value,
                                        ) =>
                                            transferForm.setData(
                                                'to_warehouse_id',
                                                value ===
                                                    NONE_VALUE
                                                    ? ''
                                                    : value,
                                            )
                                        }
                                    >
                                        <SelectTrigger id="to_warehouse_id">
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
                                id="transfer_reference_no"
                                label="Reference Number"
                                error={transferForm.errors.reference_no}
                            >
                                <Input
                                    id="transfer_reference_no"
                                    value={transferForm.data.reference_no}
                                    disabled={transferForm.processing}
                                    onChange={(event) =>
                                        transferForm.setData(
                                            'reference_no',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Optional external reference"
                                />
                            </FormField>

                            {selectedStock.product?.batch_tracking_enabled &&
                                selectedStock.product.batch_issue_policy === 'manual' && (
                                    <ManualBatchAllocationFields
                                        title="Transfer Batch Allocation"
                                        description="Choose the exact batches that will move to the destination warehouse."
                                        batches={selectedStock.batch_stocks}
                                        requestedQuantity={transferForm.data.quantity}
                                        allocations={transferForm.data.batch_allocations}
                                        processing={transferForm.processing}
                                        error={(transferForm.errors as Record<string, string>).batch_allocations}
                                        onChange={updateTransferAllocation}
                                    />
                                )}

                            {selectedStock.product?.batch_tracking_enabled &&
                                selectedStock.product.batch_issue_policy !== 'manual' && (
                                    <CalloutCard
                                        tone="info"
                                        icon={Layers3}
                                        title={`${selectedStock.product.batch_issue_policy.toUpperCase()} transfer allocation`}
                                        description="Eligible source batches will be selected automatically and the same batch identities will be preserved in the destination warehouse."
                                    />
                                )}

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


function StockDirectoryTable({
    stocks,
    onSelect,
    onCreate,
    canCreate,
}: {
    stocks: WarehouseStock[];
    onSelect: (stock: WarehouseStock) => void;
    onCreate: () => void;
    canCreate: boolean;
}) {
    return (
        <div className="overflow-hidden rounded-xl border border-border/70 bg-background/20 shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] table-fixed border-collapse">
                    <thead className="border-b border-primary/10 bg-primary/[0.025]">
                        <tr>
                            <th className="w-[280px] px-4 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                                Product
                            </th>
                            <th className="w-[220px] px-4 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                                Location
                            </th>
                            <th className="w-[185px] px-4 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                                Available
                            </th>
                            <th className="w-[170px] px-4 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                                Valuation
                            </th>
                            <th className="w-[125px] px-4 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                                Status
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-border/60">
                        {stocks.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-14">
                                    <div className="mx-auto flex max-w-sm flex-col items-center text-center">
                                        <span className="flex size-11 items-center justify-center rounded-xl border border-primary/15 bg-primary/[0.045] text-primary">
                                            <Boxes className="size-5" />
                                        </span>
                                        <h3 className="mt-3 text-sm font-semibold text-foreground">
                                            No inventory positions found
                                        </h3>
                                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                            Adjust the filters or create the first warehouse stock position.
                                        </p>
                                        {canCreate && (
                                            <Button
                                                type="button"
                                                onClick={onCreate}
                                                className="mt-4 h-9 rounded-lg px-4 text-xs"
                                            >
                                                <Plus className="size-4" />
                                                Add Stocks
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            stocks.map((stock) => {
                                const statusInfo = getStockStatus(stock);
                                const quantity = Number(stock.quantity ?? 0);
                                const averageCost = Number(stock.average_cost ?? 0);

                                return (
                                    <tr
                                        key={stock.id}
                                        role="button"
                                        tabIndex={0}
                                        aria-label={`View stock position for ${stock.product?.name ?? 'product'}`}
                                        onClick={() => onSelect(stock)}
                                        onKeyDown={(event) => {
                                            if (
                                                event.key === 'Enter' ||
                                                event.key === ' '
                                            ) {
                                                event.preventDefault();
                                                onSelect(stock);
                                            }
                                        }}
                                        className="group cursor-pointer bg-card/55 transition-colors hover:bg-primary/[0.035] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/35"
                                    >
                                        <td className="px-4 py-2.5">
                                            <EntityInfo
                                                avatar={
                                                    <EntityAvatar
                                                        icon={Package2}
                                                        className="border-primary/15 bg-primary/[0.07] text-primary transition-colors group-hover:border-primary/25 group-hover:bg-primary/10"
                                                    />
                                                }
                                                title={stock.product?.name ?? 'Unknown product'}
                                                subtitle={
                                                    <span className="font-mono text-[10px]">
                                                        {stock.product?.sku ?? 'No SKU'}
                                                    </span>
                                                }
                                            />
                                        </td>

                                        <td className="px-4 py-2.5">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <WarehouseIcon className="size-3.5 shrink-0 text-primary" />
                                                    <p className="truncate text-[11px] font-semibold">
                                                        {stock.warehouse?.name ?? 'Unknown warehouse'}
                                                    </p>
                                                </div>
                                                <p className="mt-1 truncate text-[9px] text-muted-foreground">
                                                    {stock.warehouse?.branch?.name ?? 'No branch'}
                                                    {stock.warehouse?.is_main ? ' · Main warehouse' : ''}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-4 py-2.5">
                                            <p className="text-[13px] font-semibold tabular-nums text-foreground">
                                                {formatQuantity(stock.quantity)}{' '}
                                                <span className="text-[9px] font-medium text-muted-foreground">
                                                    {stock.product?.unit ?? 'unit'}
                                                </span>
                                            </p>
                                            <p className="mt-1 text-[9px] text-muted-foreground">
                                                Reorder at {formatQuantity(stock.reorder_level)}
                                            </p>
                                        </td>

                                        <td className="px-4 py-2.5">
                                            <p className="text-[12px] font-semibold tabular-nums text-primary">
                                                {formatCurrency(quantity * averageCost)}
                                            </p>
                                            <p className="mt-1 text-[9px] text-muted-foreground">
                                                {formatCurrency(averageCost)} average
                                            </p>
                                        </td>

                                        <td className="px-4 py-2.5">
                                            <div className="flex flex-col items-start gap-1">
                                                <StatusBadge
                                                    label={statusInfo.label}
                                                    variant={statusInfo.variant}
                                                />
                                                {stock.product?.batch_tracking_enabled && (
                                                    <Badge
                                                        variant="outline"
                                                        className="h-5 rounded-full border-cyan-500/20 bg-cyan-500/[0.07] px-1.5 text-[8px] text-cyan-300"
                                                    >
                                                        {stock.batch_count} batch{stock.batch_count === 1 ? '' : 'es'}
                                                    </Badge>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function StockInsightDrawer({
    view,
    pagination,
    summary,
    onClose,
    onSelect,
}: {
    view: StockInsightView | null;
    pagination: PaginatedStocks;
    summary: StockSummary;
    onClose: () => void;
    onSelect: (stock: WarehouseStock) => void;
}) {
    const [drawerSearch, setDrawerSearch] = useState('');

    useEffect(() => {
        setDrawerSearch('');
    }, [view]);

    const activeView = view ?? 'positions';

    const configs: Record<
        StockInsightView,
        {
            title: string;
            eyebrow: string;
            description: string;
            total: string;
        }
    > = {
        valuation: {
            title: 'Inventory Valuation',
            eyebrow: 'Current weighted stock value',
            description:
                'Review loaded stock positions contributing to the current inventory valuation.',
            total: formatCurrency(summary.inventory_value),
        },
        positions: {
            title: 'Inventory Positions',
            eyebrow: 'Product and warehouse pairs',
            description:
                'Review stock positions loaded on the current page and open any record for complete details.',
            total: formatNumber(summary.records),
        },
        quantity: {
            title: 'Available Quantity',
            eyebrow: 'Combined units on hand',
            description:
                'Review the stock positions that contribute to the current available quantity.',
            total: formatQuantity(summary.total_quantity),
        },
        active_batches: {
            title: 'Active Batch Layers',
            eyebrow: 'Usable cost layers',
            description:
                'Review positions with active batch-tracked inventory and exact cost layers.',
            total: formatNumber(summary.active_batches),
        },
        expiring: {
            title: 'Expiring Batch Positions',
            eyebrow: 'Expiry warning exposure',
            description:
                'Review loaded positions with one or more batches approaching expiration.',
            total: formatNumber(summary.expiring_batches),
        },
        low_stock: {
            title: 'Low-Stock Positions',
            eyebrow: 'Replenishment attention',
            description:
                'Review loaded positions at or below their configured reorder threshold.',
            total: formatNumber(summary.low_stock),
        },
        out_of_stock: {
            title: 'Out-of-Stock Positions',
            eyebrow: 'Unavailable inventory',
            description:
                'Review loaded positions with no remaining quantity.',
            total: formatNumber(summary.out_of_stock),
        },
        health: {
            title: 'Stock Health',
            eyebrow: 'Availability distribution',
            description:
                'Review loaded healthy, low-stock, and out-of-stock positions.',
            total: formatNumber(summary.records),
        },
    };

    const config = configs[activeView];

    const matchingStocks = pagination.data.filter((stock) => {
        const quantity = Number(stock.quantity ?? 0);
        const reorder = Number(stock.reorder_level ?? 0);

        if (activeView === 'active_batches') {
            return stock.batch_count > 0;
        }
        if (activeView === 'expiring') {
            return stock.expiring_batch_count > 0;
        }
        if (activeView === 'low_stock') {
            return quantity > 0 && reorder > 0 && quantity <= reorder;
        }
        if (activeView === 'out_of_stock') {
            return quantity <= 0;
        }

        return true;
    });

    const normalizedSearch = drawerSearch.trim().toLowerCase();

    const visibleStocks = normalizedSearch
        ? matchingStocks.filter((stock) =>
              [
                  stock.product?.name,
                  stock.product?.sku,
                  stock.product?.barcode,
                  stock.warehouse?.name,
                  stock.warehouse?.code,
                  stock.warehouse?.branch?.name,
              ]
                  .filter(Boolean)
                  .join(' ')
                  .toLowerCase()
                  .includes(normalizedSearch),
          )
        : matchingStocks;

    const loadedRange =
        pagination.from !== null && pagination.to !== null
            ? `${pagination.from}-${pagination.to}`
            : '0';

    return (
        <AppDrawer
            open={view !== null}
            onOpenChange={(open) => {
                if (!open) {
                    onClose();
                }
            }}
            title={config.title}
            description={config.description}
            processing={false}
        >
            <div className="flex min-h-full flex-col bg-card">
                <div className="border-b border-primary/10 bg-gradient-to-br from-primary/[0.055] via-primary/[0.012] to-transparent px-5 py-5">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-primary">
                        {config.eyebrow}
                    </p>
                    <div className="mt-2 flex items-end justify-between gap-4">
                        <p className="text-3xl font-semibold leading-none tabular-nums text-primary">
                            {config.total}
                        </p>
                        <Badge
                            variant="outline"
                            className="h-7 rounded-full border-primary/15 bg-primary/[0.055] px-2.5 text-[9px] text-primary"
                        >
                            Loaded {loadedRange}
                        </Badge>
                    </div>
                </div>

                <div className="border-b border-border/60 p-4">
                    <SearchInput
                        value={drawerSearch}
                        onChange={(event) => setDrawerSearch(event.target.value)}
                        onClear={() => setDrawerSearch('')}
                        placeholder="Search loaded stock positions..."
                    />
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto p-4">
                    {visibleStocks.length === 0 ? (
                        <div className="flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-background/20 p-6 text-center">
                            <Boxes className="size-6 text-muted-foreground" />
                            <p className="mt-3 text-sm font-semibold">
                                No loaded matches
                            </p>
                            <p className="mt-1 text-[10px] text-muted-foreground">
                                Change the page or directory filters to review additional records.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {visibleStocks.map((stock) => {
                                const statusInfo = getStockStatus(stock);

                                return (
                                    <button
                                        key={stock.id}
                                        type="button"
                                        onClick={() => onSelect(stock)}
                                        className="flex w-full items-center gap-3 rounded-xl border border-border/60 bg-background/25 p-3 text-left transition hover:border-primary/20 hover:bg-primary/[0.035] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                                    >
                                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/[0.07] text-primary">
                                            <Package2 className="size-4" />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <p className="truncate text-[11px] font-semibold">
                                                    {stock.product?.name ?? 'Unknown product'}
                                                </p>
                                                <StatusBadge
                                                    label={statusInfo.label}
                                                    variant={statusInfo.variant}
                                                />
                                            </div>
                                            <p className="mt-1 truncate text-[9px] text-muted-foreground">
                                                {stock.warehouse?.name ?? 'Unknown warehouse'} ·{' '}
                                                {formatQuantity(stock.quantity)}{' '}
                                                {stock.product?.unit ?? 'unit'}
                                            </p>
                                            <p className="mt-1 text-[8px] text-muted-foreground">
                                                {stock.batch_count} batches · {formatCurrency(Number(stock.quantity ?? 0) * Number(stock.average_cost ?? 0))}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AppDrawer>
    );
}

function StockPositionDetailsDrawer({
    stock,
    warehouses,
    onClose,
    onAdjust,
    onTransfer,
    onSettings,
    onDelete,
}: {
    stock: WarehouseStock | null;
    warehouses: WarehouseOption[];
    onClose: () => void;
    onAdjust: (stock: WarehouseStock) => void;
    onTransfer: (stock: WarehouseStock) => void;
    onSettings: (stock: WarehouseStock) => void;
    onDelete: (stock: WarehouseStock) => void;
}) {
    if (!stock) {
        return null;
    }

    const quantity = Number(stock.quantity ?? 0);
    const averageCost = Number(stock.average_cost ?? 0);
    const statusInfo = getStockStatus(stock);

    return (
        <AppDrawer
            open
            onOpenChange={(open) => {
                if (!open) {
                    onClose();
                }
            }}
            title="Stock Position Details"
            description="Review warehouse balance, valuation, thresholds, batch layers, reconciliation, and actions."
            processing={false}
        >
            <div className="flex min-h-full flex-col bg-card">
                <div className="min-h-0 flex-1 overflow-y-auto">
                    <section className="border-b border-primary/10 bg-gradient-to-br from-primary/[0.055] via-primary/[0.012] to-transparent px-5 py-5">
                        <div className="flex items-start gap-3">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                                <Package2 className="size-5" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-primary">
                                        Warehouse inventory
                                    </p>
                                    <StatusBadge
                                        label={statusInfo.label}
                                        variant={statusInfo.variant}
                                    />
                                    {stock.product?.batch_tracking_enabled && (
                                        <Badge
                                            variant="outline"
                                            className="h-5 rounded-full border-cyan-500/20 bg-cyan-500/[0.07] px-2 text-[8px] text-cyan-300"
                                        >
                                            {stock.product.batch_issue_policy.toUpperCase()} batches
                                        </Badge>
                                    )}
                                </div>
                                <h2 className="mt-2 text-lg font-semibold tracking-[-0.025em] text-foreground">
                                    {stock.product?.name ?? 'Unknown product'}
                                </h2>
                                <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                                    {stock.product?.sku ?? 'No SKU'} ·{' '}
                                    {stock.warehouse?.name ?? 'Unknown warehouse'}
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 grid grid-cols-2 border-y border-border/60 sm:grid-cols-4">
                            <StockDetailStat
                                label="Available"
                                value={`${formatQuantity(stock.quantity)} ${stock.product?.unit ?? 'unit'}`}
                                helper="Current balance"
                                className="border-b border-r border-border/60 sm:border-b-0"
                            />
                            <StockDetailStat
                                label="Average Cost"
                                value={formatCurrency(averageCost)}
                                helper="Weighted unit cost"
                                className="border-b border-border/60 sm:border-b-0 sm:border-r"
                            />
                            <StockDetailStat
                                label="Inventory Value"
                                value={formatCurrency(quantity * averageCost)}
                                helper="Quantity × average"
                                className="border-r border-border/60"
                            />
                            <StockDetailStat
                                label="Batch Layers"
                                value={formatNumber(stock.batch_count)}
                                helper="Current batch records"
                            />
                        </div>
                    </section>

                    <div className="space-y-5 p-5">
                        <StockDetailSection
                            title="Location and thresholds"
                            description="Warehouse assignment and replenishment settings."
                            icon={WarehouseIcon}
                        >
                            <dl className="divide-y divide-border/60">
                                <StockDetailRow
                                    label="Branch"
                                    value={stock.warehouse?.branch?.name ?? 'No branch'}
                                />
                                <StockDetailRow
                                    label="Warehouse"
                                    value={stock.warehouse?.name ?? 'Unknown warehouse'}
                                />
                                <StockDetailRow
                                    label="Reorder level"
                                    value={formatQuantity(stock.reorder_level)}
                                />
                                <StockDetailRow
                                    label="Maximum stock"
                                    value={
                                        stock.max_stock_level !== null
                                            ? formatQuantity(stock.max_stock_level)
                                            : 'Not set'
                                    }
                                />
                                <StockDetailRow
                                    label="Last movement"
                                    value={`${formatDate(stock.last_movement_at)} ${formatTime(stock.last_movement_at)}`}
                                />
                            </dl>
                        </StockDetailSection>

                        <StockDetailSection
                            title="Batch and reconciliation"
                            description="Exact cost layers compared with the aggregate warehouse balance."
                            icon={Layers3}
                        >
                            <dl className="divide-y divide-border/60">
                                <StockDetailRow
                                    label="Batch tracking"
                                    value={
                                        stock.product?.batch_tracking_enabled
                                            ? 'Enabled'
                                            : 'Standard stock'
                                    }
                                />
                                <StockDetailRow
                                    label="Batch quantity"
                                    value={formatQuantity(stock.batch_quantity)}
                                />
                                <StockDetailRow
                                    label="Reconciliation"
                                    value={stock.is_reconciled ? 'Matched' : 'Mismatch'}
                                    valueClassName={
                                        stock.is_reconciled
                                            ? 'text-emerald-400'
                                            : 'text-red-400'
                                    }
                                />
                                <StockDetailRow
                                    label="Difference"
                                    value={formatQuantity(stock.reconciliation_difference)}
                                />
                                <StockDetailRow
                                    label="Expiring batches"
                                    value={formatNumber(stock.expiring_batch_count)}
                                />
                                <StockDetailRow
                                    label="Expired batches"
                                    value={formatNumber(stock.expired_batch_count)}
                                />
                            </dl>
                        </StockDetailSection>

                        {stock.batch_stocks.length > 0 && (
                            <StockDetailSection
                                title="Batch cost layers"
                                description="Current exact batch quantities, costs, dates, and status."
                                icon={Layers3}
                            >
                                <div className="space-y-2 p-4">
                                    {stock.batch_stocks.map((batch) => (
                                        <div
                                            key={batch.warehouse_batch_stock_id}
                                            className="rounded-xl border border-border/60 bg-background/25 p-3"
                                        >
                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="truncate font-mono text-[10px] font-semibold">
                                                        {batch.batch_code}
                                                    </p>
                                                    <p className="mt-1 text-[9px] text-muted-foreground">
                                                        {formatQuantity(batch.quantity)} units · {formatCurrency(Number(batch.unit_cost ?? 0))}
                                                    </p>
                                                </div>
                                                <StatusBadge
                                                    label={batch.batch_status}
                                                    variant={
                                                        batch.batch_status === 'active'
                                                            ? 'success'
                                                            : batch.batch_status === 'expired'
                                                              ? 'danger'
                                                              : 'neutral'
                                                    }
                                                />
                                            </div>
                                            <div className="mt-3 grid grid-cols-2 gap-2 text-[9px] text-muted-foreground sm:grid-cols-3">
                                                <span>Received: {formatDate(batch.received_date)}</span>
                                                <span>Expiry: {formatDate(batch.expiration_date)}</span>
                                                <span>Value: {formatCurrency(Number(batch.batch_value ?? 0))}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </StockDetailSection>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border/70 bg-background/35 px-5 py-4">
                    <Button
                        type="button"
                        onClick={() => onAdjust(stock)}
                        className="h-9 rounded-lg px-3 text-xs"
                    >
                        <ClipboardPenLine className="size-3.5" />
                        Adjust
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={warehouses.length <= 1 || quantity <= 0}
                        onClick={() => onTransfer(stock)}
                        className="h-9 rounded-lg px-3 text-xs"
                    >
                        <ArrowRightLeft className="size-3.5" />
                        Transfer
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onSettings(stock)}
                        className="h-9 rounded-lg px-3 text-xs"
                    >
                        <Settings2 className="size-3.5" />
                        Settings
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onDelete(stock)}
                        className="h-9 rounded-lg border-red-500/20 px-3 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    >
                        <Trash2 className="size-3.5" />
                        Delete
                    </Button>
                </div>
            </div>
        </AppDrawer>
    );
}

function StockDetailStat({
    label,
    value,
    helper,
    className,
}: {
    label: string;
    value: string;
    helper: string;
    className?: string;
}) {
    return (
        <div className={cn('min-w-0 px-3 py-3', className)}>
            <p className="text-[8px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                {label}
            </p>
            <p className="mt-1.5 truncate text-[12px] font-semibold tabular-nums text-primary">
                {value}
            </p>
            <p className="mt-1 truncate text-[8px] text-muted-foreground">
                {helper}
            </p>
        </div>
    );
}

function StockDetailSection({
    title,
    description,
    icon: Icon,
    children,
}: {
    title: string;
    description: string;
    icon: LucideIcon;
    children: ReactNode;
}) {
    return (
        <section className="overflow-hidden rounded-xl border border-border/70 bg-background/20">
            <div className="flex items-start gap-3 border-b border-border/60 px-4 py-3.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/[0.06] text-primary">
                    <Icon className="size-4" />
                </span>
                <div>
                    <h3 className="text-[11px] font-semibold">{title}</h3>
                    <p className="mt-1 text-[9px] leading-4 text-muted-foreground">
                        {description}
                    </p>
                </div>
            </div>
            {children}
        </section>
    );
}

function StockDetailRow({
    label,
    value,
    valueClassName,
}: {
    label: string;
    value: string;
    valueClassName?: string;
}) {
    return (
        <div className="flex items-start justify-between gap-4 px-4 py-3 text-[10px]">
            <dt className="text-muted-foreground">{label}</dt>
            <dd
                className={cn(
                    'max-w-[250px] text-right font-medium text-foreground/85',
                    valueClassName,
                )}
            >
                {value}
            </dd>
        </div>
    );
}

function StockControlMetric({
    title,
    value,
    description,
    icon: Icon,
    tone,
    className,
    onClick,
}: {
    title: string;
    value: string;
    description: string;
    icon: LucideIcon;
    tone: StockMetricTone;
    className?: string;
    onClick: () => void;
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
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'group relative min-w-0 overflow-hidden p-4 text-left transition-colors hover:bg-primary/[0.025] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/35',
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
        </button>
    );
}

type IncomingBatchField =
    | 'batch_code'
    | 'lot_number'
    | 'received_date'
    | 'manufactured_date'
    | 'expiration_date'
    | 'batch_notes';

type IncomingBatchValues = Record<IncomingBatchField, string>;

function IncomingBatchFields({
    prefix,
    title,
    description,
    values,
    requiresExpiration,
    processing,
    errors,
    onChange,
}: {
    prefix: string;
    title: string;
    description: string;
    values: IncomingBatchValues;
    requiresExpiration: boolean;
    processing: boolean;
    errors: Record<string, string>;
    onChange: (field: IncomingBatchField, value: string) => void;
}) {
    return (
        <FormSection
            title={title}
            description={description}
            icon={<Layers3 />}
        >
            <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                    id={`${prefix}_batch_code`}
                    label="Batch Code"
                    description="Leave blank to use the configured automatic sequence."
                    error={errors.batch_code}
                >
                    <Input
                        id={`${prefix}_batch_code`}
                        value={values.batch_code}
                        disabled={processing}
                        onChange={(event) =>
                            onChange('batch_code', event.target.value)
                        }
                        placeholder="Auto-generated when blank"
                    />
                </FormField>

                <FormField
                    id={`${prefix}_lot_number`}
                    label="Lot Number"
                    error={errors.lot_number}
                >
                    <Input
                        id={`${prefix}_lot_number`}
                        value={values.lot_number}
                        disabled={processing}
                        onChange={(event) =>
                            onChange('lot_number', event.target.value)
                        }
                        placeholder="Manufacturer or supplier lot"
                    />
                </FormField>

                <FormField
                    id={`${prefix}_received_date`}
                    label="Received Date"
                    error={errors.received_date}
                >
                    <Input
                        id={`${prefix}_received_date`}
                        type="date"
                        value={values.received_date}
                        disabled={processing}
                        onChange={(event) =>
                            onChange('received_date', event.target.value)
                        }
                    />
                </FormField>

                <FormField
                    id={`${prefix}_manufactured_date`}
                    label="Manufactured Date"
                    error={errors.manufactured_date}
                >
                    <Input
                        id={`${prefix}_manufactured_date`}
                        type="date"
                        value={values.manufactured_date}
                        disabled={processing}
                        onChange={(event) =>
                            onChange('manufactured_date', event.target.value)
                        }
                    />
                </FormField>

                <FormField
                    id={`${prefix}_expiration_date`}
                    label="Expiration Date"
                    required={requiresExpiration}
                    description={
                        requiresExpiration
                            ? 'Required by the selected product.'
                            : 'Optional for this product.'
                    }
                    error={errors.expiration_date}
                >
                    <Input
                        id={`${prefix}_expiration_date`}
                        type="date"
                        value={values.expiration_date}
                        disabled={processing}
                        onChange={(event) =>
                            onChange('expiration_date', event.target.value)
                        }
                    />
                </FormField>

                <FormField
                    id={`${prefix}_batch_notes`}
                    label="Batch Notes"
                    error={errors.batch_notes}
                >
                    <Input
                        id={`${prefix}_batch_notes`}
                        value={values.batch_notes}
                        disabled={processing}
                        onChange={(event) =>
                            onChange('batch_notes', event.target.value)
                        }
                        placeholder="Condition, supplier label, or remarks"
                    />
                </FormField>
            </div>
        </FormSection>
    );
}

function ManualBatchAllocationFields({
    title,
    description,
    batches,
    requestedQuantity,
    allocations,
    processing,
    error,
    onChange,
}: {
    title: string;
    description: string;
    batches: BatchStock[];
    requestedQuantity: string;
    allocations: BatchAllocationForm[];
    processing: boolean;
    error?: string;
    onChange: (stockBatchId: number, value: string) => void;
}) {
    const eligibleBatches = batches.filter(
        (batch) =>
            Number(batch.quantity) > 0 &&
            batch.batch_status === 'active' &&
            batch.expiry_state !== 'expired',
    );
    const allocatedQuantity = allocations.reduce((total, allocation) => {
        const quantity = Number(allocation.quantity || 0);
        return Number.isFinite(quantity) ? total + quantity : total;
    }, 0);
    const requested = Number(requestedQuantity || 0);
    const matched =
        requested > 0 && Math.abs(allocatedQuantity - requested) <= 0.0001;

    return (
        <FormSection
            title={title}
            description={description}
            icon={<Layers3 />}
        >
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/[0.025] px-3 py-2.5">
                <p className="text-[9px] text-muted-foreground">
                    Manual allocation must equal the requested quantity.
                </p>
                <Badge
                    variant="outline"
                    className={cn(
                        'h-6 text-[9px]',
                        matched
                            ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300'
                            : 'border-amber-500/25 bg-amber-500/10 text-amber-300',
                    )}
                >
                    {formatQuantity(allocatedQuantity)} / {formatQuantity(requested)} allocated
                </Badge>
            </div>

            <div className="space-y-2">
                {eligibleBatches.length === 0 ? (
                    <CalloutCard
                        tone="warning"
                        icon={TriangleAlert}
                        title="No eligible batches"
                        description="There are no active, non-expired batch balances available for manual allocation."
                    />
                ) : (
                    eligibleBatches.map((batch) => {
                        const allocation = allocations.find(
                            (item) =>
                                item.stock_batch_id === String(batch.stock_batch_id),
                        );

                        return (
                            <div
                                key={batch.stock_batch_id}
                                className="grid gap-3 rounded-lg border border-border/60 bg-background/40 p-3 sm:grid-cols-[minmax(0,1fr)_150px] sm:items-center"
                            >
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="truncate font-mono text-[10px] font-semibold text-primary">
                                            {batch.batch_code}
                                        </p>
                                        <StatusBadge
                                            label={batch.batch_status.replaceAll('_', ' ')}
                                            variant={batch.batch_status === 'active' ? 'success' : 'warning'}
                                        />
                                        {batch.expiry_state && (
                                            <Badge
                                                variant="outline"
                                                className="h-5 px-1.5 text-[8px]"
                                            >
                                                {batch.expiry_state}
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="mt-1 text-[9px] text-muted-foreground">
                                        Lot {batch.lot_number ?? '—'} · Available {formatQuantity(batch.quantity)} · Cost {formatCurrency(batch.unit_cost)} · Expires {formatDateValue(batch.expiration_date)}
                                    </p>
                                </div>

                                <NumberInput
                                    min="0"
                                    max={String(batch.quantity)}
                                    value={allocation?.quantity ?? ''}
                                    disabled={processing}
                                    onValueChange={(value) =>
                                        onChange(batch.stock_batch_id, value)
                                    }
                                />
                            </div>
                        );
                    })
                )}
            </div>

            {error && <p className="text-[10px] text-destructive">{error}</p>}
        </FormSection>
    );
}

function formatDateValue(value: string | null): string {
    if (!value) {
        return 'No expiration';
    }

    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(date);
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