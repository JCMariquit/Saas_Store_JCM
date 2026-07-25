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
    AlertOctagon,
    ArrowDownRight,
    ArrowRightLeft,
    ArrowUpRight,
    Boxes,
    CalendarClock,
    CheckCircle2,
    CircleDollarSign,
    ClipboardPenLine,
    FileSpreadsheet,
    FileText,
    Layers3,
    Package2,
    Plus,
    RefreshCw,
    Settings2,
    ShieldCheck,
    SlidersHorizontal,
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

type BatchIssuePolicy = 'fifo' | 'fefo' | 'manual';
type ExpiryState =
    | 'no_expiry'
    | 'safe'
    | 'warning'
    | 'critical'
    | 'expired';

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
    batch_issue_policy: BatchIssuePolicy;
    requires_expiration_date: boolean;
    expiry_warning_days: number | null;
    category: ProductCategory | null;
};

type StockProduct = ProductOption & {
    stock_tracking: 'tracked' | 'not_tracked';
    is_active: boolean;
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
    source_type: string;
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
    expiry_state: ExpiryState;
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
    batch_stocks: BatchStock[];
    batch_count: number;
    batch_quantity: string | number;
    reconciliation_difference: string | number;
    is_reconciled: boolean;
    expiring_batch_count: number;
    expired_batch_count: number;
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

type OverviewPosition = {
    id: number;
    warehouse_id: number;
    product_id: number;
    product_name: string;
    sku: string | null;
    unit: string;
    batch_tracking_enabled: boolean;
    warehouse_name: string;
    warehouse_code: string;
    branch_name: string | null;
    quantity: string | number;
    reorder_level: string | number;
    max_stock_level: string | number | null;
    average_cost: string | number;
    total_value: string | number;
    batch_count: number;
    batch_quantity: string | number;
    stock_status: 'healthy' | 'low_stock' | 'out_of_stock';
    last_movement_at: string | null;
};

type OverviewWarehouse = {
    warehouse_id: number;
    warehouse_name: string;
    warehouse_code: string;
    branch_name: string | null;
    position_count: number;
    total_quantity: string | number;
    total_value: string | number;
};

type OverviewBatch = {
    stock_batch_id: number;
    product_id: number;
    product_name: string;
    sku: string | null;
    warehouse_id: number;
    warehouse_name: string;
    branch_name: string | null;
    batch_code: string;
    lot_number: string | null;
    received_date: string | null;
    expiration_date: string | null;
    unit_cost: string | number;
    quantity: string | number;
    batch_value: string | number;
    days_to_expiry: number | null;
    expiry_state: ExpiryState;
};

type OverviewExpiry = {
    stock_batch_id: number;
    product_name: string;
    sku: string | null;
    warehouse_name: string;
    branch_name: string | null;
    batch_code: string;
    expiration_date: string | null;
    quantity: string | number;
    days_to_expiry: number | null;
    expiry_state: ExpiryState;
};

type OverviewHealth = {
    key: string;
    label: string;
    count: number;
};

type OverviewDetails = {
    positions: OverviewPosition[];
    warehouses: OverviewWarehouse[];
    batches: OverviewBatch[];
    expiry: OverviewExpiry[];
    health: OverviewHealth[];
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

type BatchSettings = {
    batch_code_prefix: string;
    batch_code_sequence_padding: number;
    auto_generate_batch_code: boolean;
    default_batch_issue_policy: BatchIssuePolicy;
    expiry_warning_days: number;
    expiry_critical_days: number;
    allow_expired_issue: boolean;
    allow_negative_stock: boolean;
    require_batch_for_tracked_products: boolean;
};

type StockPageProps = {
    stocks: PaginatedStocks;
    branches: BranchOption[];
    warehouses: WarehouseOption[];
    categories: CategoryOption[];
    products: ProductOption[];
    positionKeys: string[];
    batchSettings: BatchSettings;
    summary: StockSummary;
    overviewDetails: OverviewDetails;
    filters: StockFilters;
    movementTypes: MovementType[];
};

type BatchAllocationInput = {
    stock_batch_id: string;
    quantity: string;
};

type IncomingBatchFields = {
    batch_code: string;
    lot_number: string;
    received_date: string;
    manufactured_date: string;
    expiration_date: string;
    batch_notes: string;
};

type CreateStockForm = IncomingBatchFields & {
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

type AdjustStockForm = IncomingBatchFields & {
    movement_type: string;
    quantity: string;
    unit_cost: string;
    reference_no: string;
    batch_allocations: BatchAllocationInput[];
    remarks: string;
};

type TransferStockForm = {
    destination_warehouse_id: string;
    quantity: string;
    reference_no: string;
    batch_allocations: BatchAllocationInput[];
    remarks: string;
};

type OverviewDrawerType = 'positions' | 'quantity' | 'batches' | 'expiry' | 'health' | null;

type DrawerType =
    | 'create'
    | 'settings'
    | 'adjust'
    | 'transfer'
    | 'batches'
    | null;

type StockMetricTone =
    | 'primary'
    | 'emerald'
    | 'amber'
    | 'red';

/*
|--------------------------------------------------------------------------
| Configuration
|--------------------------------------------------------------------------
*/

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Inventory', href: '/inventory/overview' },
    { title: 'Stock Management', href: '/inventory/stocks' },
];

const ALL_VALUE = 'all';
const NONE_VALUE = 'none';

const emptyBatchFields: IncomingBatchFields = {
    batch_code: '',
    lot_number: '',
    received_date: todayInputValue(),
    manufactured_date: '',
    expiration_date: '',
    batch_notes: '',
};

const emptySettingsForm: StockSettingsForm = {
    reorder_level: '0',
    max_stock_level: '',
};

const emptyAdjustForm: AdjustStockForm = {
    movement_type: 'stock_in',
    quantity: '',
    unit_cost: '',
    reference_no: '',
    batch_allocations: [],
    remarks: '',
    ...emptyBatchFields,
};

const emptyTransferForm: TransferStockForm = {
    destination_warehouse_id: '',
    quantity: '',
    reference_no: '',
    batch_allocations: [],
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
        opening_quantity: '',
        reorder_level: '5',
        max_stock_level: '',
        unit_cost: '',
        remarks: '',
        ...emptyBatchFields,
        received_date: todayInputValue(),
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
    positionKeys,
    batchSettings,
    summary,
    overviewDetails,
    filters,
    movementTypes,
}: StockPageProps) {
    const [drawerType, setDrawerType] =
        useState<DrawerType>(null);

    const [overviewDrawer, setOverviewDrawer] =
        useState<OverviewDrawerType>(null);

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

    const settingsForm = useForm<StockSettingsForm>({
        ...emptySettingsForm,
    });

    const adjustForm = useForm<AdjustStockForm>({
        ...emptyAdjustForm,
        received_date: todayInputValue(),
    });

    const transferForm = useForm<TransferStockForm>({
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

    const availableCreateProducts = useMemo(
        () => products,
        [products],
    );

    const selectedCreateProduct = useMemo(
        () =>
            products.find(
                (product) =>
                    String(product.id) ===
                    createForm.data.product_id,
            ) ?? null,
        [createForm.data.product_id, products],
    );

    const selectedCreatePositionExists = useMemo(
        () =>
            Boolean(
                createForm.data.warehouse_id &&
                    createForm.data.product_id &&
                    positionKeys.includes(
                        `${createForm.data.warehouse_id}:${createForm.data.product_id}`,
                    ),
            ),
        [
            createForm.data.product_id,
            createForm.data.warehouse_id,
            positionKeys,
        ],
    );

    const selectedMovement = movementTypes.find(
        (movement) =>
            movement.value ===
            adjustForm.data.movement_type,
    );

    const isIncomingMovement =
        selectedMovement?.direction === 'in';

    const selectedProduct = selectedStock?.product ?? null;

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

    const eligibleAdjustmentBatches = useMemo(() => {
        if (!selectedStock) {
            return [];
        }

        return selectedStock.batch_stocks.filter(
            (batch) => {
                if (
                    adjustForm.data.movement_type ===
                    'expired'
                ) {
                    return batch.expiry_state === 'expired';
                }

                if (
                    ['damage', 'return_out'].includes(
                        adjustForm.data.movement_type,
                    )
                ) {
                    return true;
                }

                return (
                    batch.expiry_state !== 'expired' ||
                    batchSettings.allow_expired_issue
                );
            },
        );
    }, [
        adjustForm.data.movement_type,
        batchSettings.allow_expired_issue,
        selectedStock,
    ]);

    const eligibleTransferBatches = useMemo(() => {
        if (!selectedStock) {
            return [];
        }

        return selectedStock.batch_stocks.filter(
            (batch) =>
                batch.expiry_state !== 'expired' ||
                batchSettings.allow_expired_issue,
        );
    }, [batchSettings.allow_expired_issue, selectedStock]);

    const adjustmentUsesManualAllocation = Boolean(
        !isIncomingMovement &&
            selectedProduct?.batch_tracking_enabled &&
            selectedProduct.batch_issue_policy === 'manual',
    );

    const transferUsesManualAllocation = Boolean(
        selectedProduct?.batch_tracking_enabled &&
            selectedProduct.batch_issue_policy === 'manual',
    );

    const isAnyFormProcessing =
        createForm.processing ||
        settingsForm.processing ||
        adjustForm.processing ||
        transferForm.processing;

    const requirementsComplete =
        warehouses.length > 0 && products.length > 0;


    const reportQueryString = useMemo(() => {
        const query = new URLSearchParams();

        if (search.trim()) query.set('search', search.trim());
        if (status) query.set('status', status);
        if (batchStatus) query.set('batch_status', batchStatus);
        if (branchId) query.set('branch_id', branchId);
        if (warehouseId) query.set('warehouse_id', warehouseId);
        if (categoryId) query.set('category_id', categoryId);

        const value = query.toString();
        return value ? `?${value}` : '';
    }, [search, status, batchStatus, branchId, warehouseId, categoryId]);

    const stockPdfUrl = `/reports/inventory/stocks/pdf${reportQueryString}`;
    const stockExcelPreviewUrl = `/reports/inventory/stocks/excel-preview${reportQueryString}`;

    function openReport(url: string): void {
        const reportWindow = window.open(
            url,
            '_blank',
            'noopener,noreferrer',
        );

        if (reportWindow) {
            reportWindow.opener = null;
        }
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
            received_date: todayInputValue(),
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
            ...emptyAdjustForm,
            received_date: todayInputValue(),
            unit_cost: String(
                stock.average_cost ?? '',
            ),
            batch_allocations: makeAllocationInputs(
                stock.batch_stocks,
            ),
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
            reference_no: '',
            batch_allocations: makeAllocationInputs(
                stock.batch_stocks,
            ),
            remarks: '',
        });
        setDrawerType('transfer');
    }

    function openBatchesDrawer(
        stock: WarehouseStock,
    ): void {
        setSelectedStock(stock);
        setDrawerType('batches');
    }


    function openOverviewDrawer(type: Exclude<OverviewDrawerType, null>): void {
        setOverviewDrawer(type);
    }

    function closeOverviewDrawer(): void {
        setOverviewDrawer(null);
    }

    function requestDeleteFromDetails(): void {
        if (!selectedStock) return;

        const target = selectedStock;
        setDrawerType(null);
        setSelectedStock(null);
        setDeleteTarget(target);
    }

    /*
    |--------------------------------------------------------------------------
    | Form mutations
    |--------------------------------------------------------------------------
    */

    function handleCreateWarehouseChange(
        value: string,
    ): void {
        createForm.setData(
            'warehouse_id',
            value === NONE_VALUE ? '' : value,
        );
    }

    function handleCreateProductChange(
        selectedValue: string,
    ): void {
        const value =
            selectedValue === NONE_VALUE
                ? ''
                : selectedValue;

        const product = products.find(
            (item) => String(item.id) === value,
        );

        createForm.setData({
            ...createForm.data,
            product_id: value,
            unit_cost: product
                ? String(product.cost_price)
                : '',
            batch_code: '',
            lot_number: '',
            received_date: todayInputValue(),
            manufactured_date: '',
            expiration_date: '',
            batch_notes: '',
        });
    }

    function handleMovementTypeChange(
        movementType: string,
    ): void {
        const movement = movementTypes.find(
            (item) => item.value === movementType,
        );

        adjustForm.setData({
            ...adjustForm.data,
            movement_type: movementType,
            unit_cost:
                movement?.direction === 'in'
                    ? String(
                          selectedStock?.average_cost ?? '',
                      )
                    : '',
            batch_code: '',
            lot_number: '',
            received_date: todayInputValue(),
            manufactured_date: '',
            expiration_date: '',
            batch_notes: '',
            batch_allocations: makeAllocationInputs(
                selectedStock?.batch_stocks ?? [],
            ),
        });
    }

    function updateAdjustmentAllocation(
        stockBatchId: number,
        quantity: string,
    ): void {
        adjustForm.setData(
            'batch_allocations',
            updateAllocationInput(
                adjustForm.data.batch_allocations,
                stockBatchId,
                quantity,
            ),
        );
    }

    function updateTransferAllocation(
        stockBatchId: number,
        quantity: string,
    ): void {
        transferForm.setData(
            'batch_allocations',
            updateAllocationInput(
                transferForm.data.batch_allocations,
                stockBatchId,
                quantity,
            ),
        );
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
                search: search.trim() || undefined,
                status: status || undefined,
                batch_status:
                    batchStatus || undefined,
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

        const currentWarehouse = warehouses.find(
            (warehouse) =>
                String(warehouse.id) === warehouseId,
        );

        if (
            currentWarehouse &&
            String(currentWarehouse.branch_id) !== value
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
        if (!deleteTarget || deleteProcessing) {
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

    const stockColumns: DataTableColumn<WarehouseStock>[] = [
        {
            key: 'product',
            header: 'Product',
            className: 'min-w-[250px]',
            cell: (stock) => (
                <StockRowButton
                    stock={stock}
                    onOpen={openBatchesDrawer}
                    label={`Open details for ${stock.product?.name ?? 'stock record'}`}
                >
                    <EntityInfo
                        avatar={
                            <EntityAvatar
                                icon={Package2}
                                className="border-primary/15 bg-primary/10 text-primary"
                            />
                        }
                        title={stock.product?.name ?? 'Unknown product'}
                        subtitle={
                            <>
                                SKU:{' '}
                                <span className="font-semibold text-foreground/70">
                                    {stock.product?.sku ?? '—'}
                                </span>
                            </>
                        }
                        description={
                            stock.product?.category?.name ??
                            'Uncategorized'
                        }
                    />
                </StockRowButton>
            ),
        },
        {
            key: 'location',
            header: 'Location',
            className: 'min-w-[210px]',
            cell: (stock) => (
                <StockRowButton
                    stock={stock}
                    onOpen={openBatchesDrawer}
                    label={`Open ${stock.product?.name ?? 'stock'} at ${stock.warehouse?.name ?? 'warehouse'}`}
                >
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex size-7 items-center justify-center rounded-lg border border-primary/15 bg-primary/10 text-primary">
                                <WarehouseIcon className="size-3.5" />
                            </span>
                            <span className="max-w-40 truncate text-[12px] font-semibold">
                                {stock.warehouse?.name ??
                                    'Unknown warehouse'}
                            </span>
                            {stock.warehouse?.is_main && (
                                <Badge
                                    variant="outline"
                                    className="h-5 rounded-full border-amber-500/20 bg-amber-500/10 px-2 text-[9px] font-semibold text-amber-300"
                                >
                                    MAIN
                                </Badge>
                            )}
                        </div>
                        <p className="pl-9 text-[10px] text-muted-foreground">
                            {stock.warehouse?.branch?.name ??
                                'No branch'}
                        </p>
                    </div>
                </StockRowButton>
            ),
        },
        {
            key: 'on_hand',
            header: 'On Hand',
            className: 'min-w-[170px]',
            cell: (stock) => {
                const statusInfo = getStockStatus(stock);

                return (
                    <StockRowButton
                        stock={stock}
                        onOpen={openBatchesDrawer}
                        label={`Open balance details for ${stock.product?.name ?? 'stock record'}`}
                    >
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                                <span className="text-[17px] font-semibold tabular-nums">
                                    {formatQuantity(stock.quantity)}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                    {stock.product?.unit ?? 'unit'}
                                </span>
                            </div>
                            <StatusBadge
                                label={statusInfo.label}
                                variant={statusInfo.variant}
                            />
                        </div>
                    </StockRowButton>
                );
            },
        },
        {
            key: 'batch_signal',
            header: 'Batch / Expiry',
            className: 'min-w-[210px]',
            cell: (stock) => (
                <StockRowButton
                    stock={stock}
                    onOpen={openBatchesDrawer}
                    label={`Open batch details for ${stock.product?.name ?? 'stock record'}`}
                >
                    <div className="space-y-1.5 text-[10px]">
                        <div className="flex items-center gap-1.5 font-semibold">
                            <Layers3 className="size-3.5 text-primary" />
                            {stock.batch_count} active layer
                            {stock.batch_count === 1 ? '' : 's'}
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {stock.expired_batch_count > 0 && (
                                <MiniToneBadge tone="red">
                                    {stock.expired_batch_count} expired
                                </MiniToneBadge>
                            )}
                            {stock.expiring_batch_count > 0 && (
                                <MiniToneBadge tone="amber">
                                    {stock.expiring_batch_count} expiring
                                </MiniToneBadge>
                            )}
                            {stock.expired_batch_count === 0 &&
                                stock.expiring_batch_count === 0 && (
                                    <MiniToneBadge tone="emerald">
                                        clear
                                    </MiniToneBadge>
                                )}
                            {!stock.is_reconciled && (
                                <MiniToneBadge tone="red">
                                    mismatch
                                </MiniToneBadge>
                            )}
                        </div>
                    </div>
                </StockRowButton>
            ),
        },
    ];

    /*
    |--------------------------------------------------------------------------
    | Overview values
    |--------------------------------------------------------------------------
    */

    const attentionRecords = Math.min(
        summary.records,
        summary.low_stock + summary.out_of_stock,
    );

    const healthyRecords = Math.max(
        0,
        summary.records - attentionRecords,
    );

    const healthyPercentage =
        summary.records > 0
            ? Math.round(
                  (healthyRecords / summary.records) * 100,
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
        summary.reconciliation_mismatches > 0
            ? `${summary.reconciliation_mismatches} reconciliation issue${summary.reconciliation_mismatches === 1 ? '' : 's'}`
            : summary.expired_batches > 0
              ? `${summary.expired_batches} expired batch${summary.expired_batches === 1 ? '' : 'es'}`
              : summary.out_of_stock > 0
                ? `${summary.out_of_stock} out of stock`
                : summary.low_stock > 0
                  ? `${summary.low_stock} low stock`
                  : summary.records === 0
                    ? 'No stock positions'
                    : 'Inventory healthy';

    const inventoryHealthClass =
        summary.reconciliation_mismatches > 0 ||
        summary.expired_batches > 0
            ? 'border-red-500/20 bg-red-500/10 text-red-300'
            : summary.low_stock > 0 ||
                summary.out_of_stock > 0 ||
                summary.expiring_batches > 0
              ? 'border-amber-500/20 bg-amber-500/10 text-amber-300'
              : summary.records === 0
                ? 'border-slate-500/20 bg-slate-500/10 text-slate-300'
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
                                    <Button asChild variant="outline" size="sm">
                                        <Link href="/locations/warehouses">
                                            Add Warehouse
                                        </Link>
                                    </Button>
                                )}
                                {products.length === 0 && (
                                    <Button asChild variant="outline" size="sm">
                                        <Link href="/inventory/products">
                                            Add Product
                                        </Link>
                                    </Button>
                                )}
                            </>
                        }
                    />
                )}

                {summary.reconciliation_mismatches > 0 && (
                    <CalloutCard
                        tone="danger"
                        icon={AlertOctagon}
                        title="Batch reconciliation requires attention"
                        description={`${summary.reconciliation_mismatches} inventory position${summary.reconciliation_mismatches === 1 ? '' : 's'} differ from their batch-layer totals. Filter by Reconciliation Mismatch before posting more stock changes.`}
                    />
                )}

                <section className="min-w-0 overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.075] via-card/70 to-card/40">
                    <div className="flex flex-col gap-3 border-b border-border/60 bg-background/20 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                                <Boxes className="size-4" />
                            </span>
                            <div className="min-w-0">
                                <p className="text-[12px] font-semibold">Stock Management</p>
                                <p className="mt-0.5 text-[9px] text-muted-foreground">
                                    Warehouse balances, active cost layers, expiry exposure, and reconciliation.
                                </p>
                            </div>
                        </div>

                        <Badge
                            variant="outline"
                            className={cn(
                                'h-7 w-fit gap-1.5 rounded-full px-2.5 text-[9px] font-semibold',
                                inventoryHealthClass,
                            )}
                        >
                            {summary.reconciliation_mismatches > 0 ||
                            summary.expired_batches > 0 ? (
                                <AlertOctagon className="size-3" />
                            ) : summary.low_stock > 0 ||
                              summary.out_of_stock > 0 ||
                              summary.expiring_batches > 0 ? (
                                <TriangleAlert className="size-3" />
                            ) : (
                                <CheckCircle2 className="size-3" />
                            )}
                            {inventoryHealthLabel}
                        </Badge>
                    </div>

                    <div className="grid min-w-0 xl:grid-cols-[minmax(0,1.15fr)_minmax(420px,0.85fr)]">
                        <div className="relative overflow-hidden border-b border-border/60 p-4 xl:border-b-0 xl:border-r md:p-5">
                            <CircleDollarSign className="pointer-events-none absolute -bottom-10 -right-6 size-36 text-primary opacity-[0.025]" />
                            <div className="relative">
                                <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-primary/80">
                                    Current Inventory Valuation
                                </p>
                                <p className="mt-3 text-[30px] font-semibold leading-none tracking-[-0.045em] tabular-nums text-primary sm:text-[34px]">
                                    {formatCurrency(summary.inventory_value)}
                                </p>
                                <p className="mt-2 max-w-xl text-[9px] leading-4 text-muted-foreground">
                                    Weighted acquisition value synchronized from warehouse and batch balances.
                                </p>

                                <button
                                    type="button"
                                    onClick={() => openOverviewDrawer('health')}
                                    className="mt-5 w-full rounded-xl border border-border/60 bg-background/35 p-3.5 text-left transition hover:border-primary/25 hover:bg-primary/[0.035]"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-[9px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                                                Position Health
                                            </p>
                                            <p className="mt-1 text-[9px] text-muted-foreground">
                                                {healthyRecords} healthy from {summary.records} positions — open breakdown
                                            </p>
                                        </div>
                                        <span className="text-sm font-semibold tabular-nums text-emerald-400">
                                            {healthyPercentage}%
                                        </span>
                                    </div>
                                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full bg-emerald-400"
                                            style={{ width: `${healthyPercentage}%` }}
                                        />
                                    </div>
                                </button>
                            </div>
                        </div>

                        <div className="grid min-w-0 grid-cols-2">
                            <StockControlMetric title="Positions" value={formatNumber(summary.records)} description="Product-location pairs" icon={Layers3} tone="primary" className="border-b border-r border-border/60" onClick={() => openOverviewDrawer('positions')} />
                            <StockControlMetric title="Quantity" value={formatQuantity(summary.total_quantity)} description="Available units" icon={Boxes} tone="primary" className="border-b border-border/60" onClick={() => openOverviewDrawer('quantity')} />
                            <StockControlMetric title="Active Batches" value={formatNumber(summary.active_batches)} description="Available cost layers" icon={Package2} tone="emerald" className="border-r border-border/60" onClick={() => openOverviewDrawer('batches')} />
                            <StockControlMetric title="Expiring" value={formatNumber(summary.expiring_batches)} description="Within warning window" icon={CalendarClock} tone="amber" onClick={() => openOverviewDrawer('expiry')} />
                        </div>
                    </div>
                </section>

                <SectionCard
                    title="Warehouse Stock Directory"
                    description="Click any stock row to review its full balance, valuation, thresholds, reconciliation, and batch cost layers."
                    className="min-w-0 max-w-full"
                    actions={
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge
                                variant="outline"
                                className="h-7 rounded-full border-primary/15 bg-primary/[0.06] px-2.5 text-[10px] font-medium text-primary/80"
                            >
                                <Layers3 className="mr-1 size-3" />
                                {stocks.total} record
                                {stocks.total === 1 ? '' : 's'}
                            </Badge>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={stocks.total === 0}
                                onClick={() => openReport(stockPdfUrl)}
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
                                    openReport(stockExcelPreviewUrl)
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
                                Add Stock
                            </Button>
                        </div>
                    }
                >
                    <FilterBar
                        onSubmit={applyFilters}
                        contentClassName="w-full"
                        actions={
                            <div className="flex flex-wrap gap-2">
                                <Button type="submit" variant="secondary" className="h-10 px-4 text-sm">Apply Filters</Button>
                                <Button type="button" variant="outline" onClick={resetFilters} disabled={!hasActiveFilters} className="h-10 px-3 text-sm">
                                    <RefreshCw className="size-3.5" /> Reset
                                </Button>
                            </div>
                        }
                    >
                        <div className="w-full space-y-3">
                            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                                <SlidersHorizontal className="size-3.5 text-primary" /> Directory Filters
                            </div>
                            <SearchInput value={search} onChange={(event) => setSearch(event.target.value)} onClear={() => setSearch('')} placeholder="Search product, SKU, barcode, warehouse, or branch..." className="w-full" />
                            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                                <FilterSelectField label="Branch">
                                    <Select value={branchId || ALL_VALUE} onValueChange={(value) => handleBranchChange(value === ALL_VALUE ? '' : value)}>
                                        <SelectTrigger className="h-10 w-full text-sm"><SelectValue placeholder="All branches" /></SelectTrigger>
                                        <SelectContent><SelectItem value={ALL_VALUE}>All branches</SelectItem>{branches.map((branch) => <SelectItem key={branch.id} value={String(branch.id)}>{branch.name}{branch.is_main ? ' — Main' : ''}</SelectItem>)}</SelectContent>
                                    </Select>
                                </FilterSelectField>
                                <FilterSelectField label="Warehouse">
                                    <Select value={warehouseId || ALL_VALUE} onValueChange={(value) => setWarehouseId(value === ALL_VALUE ? '' : value)}>
                                        <SelectTrigger className="h-10 w-full text-sm"><SelectValue placeholder="All warehouses" /></SelectTrigger>
                                        <SelectContent><SelectItem value={ALL_VALUE}>All warehouses</SelectItem>{filteredWarehouses.map((warehouse) => <SelectItem key={warehouse.id} value={String(warehouse.id)}>{warehouse.name}{warehouse.is_main ? ' — Main' : ''}</SelectItem>)}</SelectContent>
                                    </Select>
                                </FilterSelectField>
                                <FilterSelectField label="Category">
                                    <Select value={categoryId || ALL_VALUE} onValueChange={(value) => setCategoryId(value === ALL_VALUE ? '' : value)}>
                                        <SelectTrigger className="h-10 w-full text-sm"><SelectValue placeholder="All categories" /></SelectTrigger>
                                        <SelectContent><SelectItem value={ALL_VALUE}>All categories</SelectItem>{categories.map((category) => <SelectItem key={category.id} value={String(category.id)}>{category.parent_id ? '— ' : ''}{category.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </FilterSelectField>
                                <FilterSelectField label="Stock Condition">
                                    <Select value={status || ALL_VALUE} onValueChange={(value) => setStatus(value === ALL_VALUE ? '' : value)}>
                                        <SelectTrigger className="h-10 w-full text-sm"><SelectValue placeholder="All conditions" /></SelectTrigger>
                                        <SelectContent><SelectItem value={ALL_VALUE}>All conditions</SelectItem><SelectItem value="in_stock">In stock</SelectItem><SelectItem value="low_stock">Low stock</SelectItem><SelectItem value="out_of_stock">Out of stock</SelectItem></SelectContent>
                                    </Select>
                                </FilterSelectField>
                                <FilterSelectField label="Batch State">
                                    <Select value={batchStatus || ALL_VALUE} onValueChange={(value) => setBatchStatus(value === ALL_VALUE ? '' : value)}>
                                        <SelectTrigger className="h-10 w-full text-sm"><SelectValue placeholder="All batch states" /></SelectTrigger>
                                        <SelectContent><SelectItem value={ALL_VALUE}>All batch states</SelectItem><SelectItem value="batch_enabled">Batch enabled</SelectItem><SelectItem value="standard">Standard tracking</SelectItem><SelectItem value="expiring">Has expiring batch</SelectItem><SelectItem value="expired">Has expired batch</SelectItem><SelectItem value="mismatch">Reconciliation mismatch</SelectItem></SelectContent>
                                    </Select>
                                </FilterSelectField>
                            </div>
                        </div>
                    </FilterBar>

                    <DataTable
                        data={stocks.data}
                        columns={stockColumns}
                        getRowKey={(stock) => stock.id}
                        emptyIcon={Boxes}
                        emptyTitle="No warehouse stock records found"
                        emptyDescription="No warehouse stock records matched the current filters. Reset the filters or add the first stock record."
                        emptyAction={
                            <div className="flex flex-wrap justify-center gap-2">
                                {hasActiveFilters && (
                                    <Button type="button" variant="outline" onClick={resetFilters}>
                                        <RefreshCw className="size-4" />
                                        Reset Filters
                                    </Button>
                                )}
                            </div>
                        }
                        minWidth="840px"
                    />

                    <AppPagination
                        pagination={stocks}
                        itemLabel="stock records"
                    />
                </SectionCard>
            </PageContainer>

            {/* Add stocks drawer */}
            <AppDrawer
                open={drawerType === 'create'}
                onOpenChange={(open) => {
                    if (!open) closeDrawer();
                }}
                title="Add Stock"
                description="Add a new quantity to a warehouse. Existing stock is recorded as a separate batch or cost layer."
                processing={createForm.processing}
            >
                <form onSubmit={submitCreateStock} className="flex min-h-full flex-col">
                    <div className="flex-1 space-y-4 p-5">
                        <FormSection
                            title="Stock Destination"
                            description="Select the warehouse and product that will receive this stock."
                            icon={<WarehouseIcon />}
                        >
                            <FormField
                                id="warehouse_id"
                                label="Warehouse"
                                error={createForm.errors.warehouse_id}
                                required
                            >
                                <Select
                                    value={createForm.data.warehouse_id || NONE_VALUE}
                                    disabled={createForm.processing}
                                    onValueChange={handleCreateWarehouseChange}
                                >
                                    <SelectTrigger id="warehouse_id">
                                        <SelectValue placeholder="Select warehouse" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={NONE_VALUE}>Select warehouse</SelectItem>
                                        {warehouses.map((warehouse) => (
                                            <SelectItem key={warehouse.id} value={String(warehouse.id)}>
                                                {warehouse.name}{warehouse.branch ? ` — ${warehouse.branch.name}` : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormField>

                            <FormField
                                id="product_id"
                                label="Product"
                                description={
                                    createForm.data.warehouse_id
                                        ? `${availableCreateProducts.length} active tracked products`
                                        : 'Choose a warehouse first'
                                }
                                error={createForm.errors.product_id}
                                required
                            >
                                <Select
                                    value={createForm.data.product_id || NONE_VALUE}
                                    disabled={createForm.processing || !createForm.data.warehouse_id}
                                    onValueChange={handleCreateProductChange}
                                >
                                    <SelectTrigger id="product_id">
                                        <SelectValue placeholder="Select product" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={NONE_VALUE}>Select product</SelectItem>
                                        {availableCreateProducts.map((product) => (
                                            <SelectItem key={product.id} value={String(product.id)}>
                                                {product.name}{product.sku ? ` — ${product.sku}` : ''}{product.batch_tracking_enabled ? ' • Batch' : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormField>
                        </FormSection>

                        {selectedCreateProduct && (
                            <ProductBatchPolicyCard product={selectedCreateProduct} />
                        )}

                        {selectedCreatePositionExists && (
                            <CalloutCard
                                tone="success"
                                icon={Layers3}
                                title="Existing stock position found"
                                description="The current quantity remains intact. This stock-in will create a new batch or internal cost layer and will be added to the warehouse total."
                            />
                        )}

                        <FormSection
                            title="Stock Addition"
                            description={
                                selectedCreatePositionExists
                                    ? 'This quantity will be added as a new batch or cost layer without replacing the current balance.'
                                    : 'This will create the first stock position and cost layer for the selected warehouse.'
                            }
                            icon={<Boxes />}
                        >
                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField
                                    id="opening_quantity"
                                    label="Quantity to Add"
                                    error={createForm.errors.opening_quantity}
                                    required
                                >
                                    <NumberInput
                                        id="opening_quantity"
                                        min="0"
                                        value={createForm.data.opening_quantity}
                                        disabled={createForm.processing}
                                        onValueChange={(value) => createForm.setData('opening_quantity', value)}
                                    />
                                </FormField>

                                <FormField
                                    id="unit_cost"
                                    label="Unit Cost"
                                    description="Defaults from the product record"
                                    error={createForm.errors.unit_cost}
                                >
                                    <MoneyInput
                                        id="unit_cost"
                                        value={createForm.data.unit_cost}
                                        disabled={createForm.processing}
                                        onValueChange={(value) => createForm.setData('unit_cost', value)}
                                    />
                                </FormField>
                            </div>
                        </FormSection>

                        {selectedCreateProduct?.batch_tracking_enabled &&
                            Number(createForm.data.opening_quantity || 0) > 0 && (
                                <IncomingBatchSection
                                    prefix="opening"
                                    product={selectedCreateProduct}
                                    autoGenerateCode={batchSettings.auto_generate_batch_code}
                                    values={createForm.data}
                                    errors={createForm.errors}
                                    disabled={createForm.processing}
                                    setValue={(key, value) => createForm.setData(key, value)}
                                />
                            )}

                        {!selectedCreatePositionExists && (
                            <FormSection
                                title="Stock Thresholds"
                                description="Configure replenishment alerts for this new warehouse position."
                                icon={<TriangleAlert />}
                            >
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <FormField
                                        id="reorder_level"
                                        label="Reorder Level"
                                        error={createForm.errors.reorder_level}
                                        required
                                    >
                                        <NumberInput
                                            id="reorder_level"
                                            min="0"
                                            value={createForm.data.reorder_level}
                                            disabled={createForm.processing}
                                            onValueChange={(value) => createForm.setData('reorder_level', value)}
                                        />
                                    </FormField>

                                    <FormField
                                        id="max_stock_level"
                                        label="Maximum Level"
                                        description="Optional"
                                        error={createForm.errors.max_stock_level}
                                    >
                                        <NumberInput
                                            id="max_stock_level"
                                            min="0"
                                            value={createForm.data.max_stock_level}
                                            disabled={createForm.processing}
                                            placeholder="Optional"
                                            onValueChange={(value) => createForm.setData('max_stock_level', value)}
                                        />
                                    </FormField>
                                </div>
                            </FormSection>
                        )}

                        <FormField
                            id="create_remarks"
                            label="Remarks"
                            error={createForm.errors.remarks}
                        >
                            <Textarea
                                id="create_remarks"
                                rows={4}
                                value={createForm.data.remarks}
                                disabled={createForm.processing}
                                onChange={(event) => createForm.setData('remarks', event.target.value)}
                                placeholder="Optional notes about this stock addition..."
                                className="resize-none"
                            />
                        </FormField>
                    </div>

                    <AppDrawerActions
                        processing={createForm.processing}
                        onCancel={closeDrawer}
                        submitLabel="Add Stock"
                        processingLabel="Adding Stocks..."
                    />
                </form>
            </AppDrawer>

            {/* Settings drawer */}
            <AppDrawer
                open={drawerType === 'settings' && selectedStock !== null}
                onOpenChange={(open) => {
                    if (!open) closeDrawer();
                }}
                title="Stock Settings"
                description={`Update replenishment thresholds for ${selectedStock?.product?.name ?? 'this product'}.`}
                processing={settingsForm.processing}
            >
                {selectedStock && (
                    <form onSubmit={submitSettings} className="flex min-h-full flex-col">
                        <div className="flex-1 space-y-4 p-5">
                            <StockContextCard stock={selectedStock} />

                            <FormSection
                                title="Threshold Settings"
                                description="Set the low-stock and maximum inventory levels."
                                icon={<Settings2 />}
                            >
                                <FormField
                                    id="settings_reorder_level"
                                    label="Reorder Level"
                                    error={settingsForm.errors.reorder_level}
                                    required
                                >
                                    <NumberInput
                                        id="settings_reorder_level"
                                        min="0"
                                        value={settingsForm.data.reorder_level}
                                        disabled={settingsForm.processing}
                                        onValueChange={(value) => settingsForm.setData('reorder_level', value)}
                                    />
                                </FormField>

                                <FormField
                                    id="settings_max_stock_level"
                                    label="Maximum Stock Level"
                                    description="Optional"
                                    error={settingsForm.errors.max_stock_level}
                                >
                                    <NumberInput
                                        id="settings_max_stock_level"
                                        min="0"
                                        value={settingsForm.data.max_stock_level}
                                        disabled={settingsForm.processing}
                                        placeholder="Optional"
                                        onValueChange={(value) => settingsForm.setData('max_stock_level', value)}
                                    />
                                </FormField>
                            </FormSection>
                        </div>

                        <AppDrawerActions
                            processing={settingsForm.processing}
                            onCancel={closeDrawer}
                            submitLabel="Save Settings"
                            processingLabel="Saving Settings..."
                        />
                    </form>
                )}
            </AppDrawer>

            {/* Adjustment drawer */}
            <AppDrawer
                open={drawerType === 'adjust' && selectedStock !== null}
                onOpenChange={(open) => {
                    if (!open) closeDrawer();
                }}
                title="Adjust Stock"
                description="Post a batch-aware stock increase or decrease."
                processing={adjustForm.processing}
            >
                {selectedStock && (
                    <form onSubmit={submitAdjustment} className="flex min-h-full flex-col">
                        <div className="flex-1 space-y-4 p-5">
                            <StockContextCard stock={selectedStock} />

                            {!selectedStock.is_reconciled && (
                                <CalloutCard
                                    tone="danger"
                                    icon={AlertOctagon}
                                    title="Adjustment blocked by reconciliation issue"
                                    description="The aggregate warehouse quantity does not match the sum of batch balances. Repair the data before posting another adjustment."
                                />
                            )}

                            <FormSection
                                title="Stock Movement"
                                description="Choose the movement reason and quantity."
                                icon={<ClipboardPenLine />}
                            >
                                <FormField
                                    id="movement_type"
                                    label="Movement Type"
                                    error={adjustForm.errors.movement_type}
                                    required
                                >
                                    <Select
                                        value={adjustForm.data.movement_type}
                                        disabled={adjustForm.processing}
                                        onValueChange={handleMovementTypeChange}
                                    >
                                        <SelectTrigger id="movement_type">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {movementTypes.map((movement) => (
                                                <SelectItem key={movement.value} value={movement.value}>
                                                    {movement.direction === 'in' ? 'Stock In — ' : 'Stock Out — '}{movement.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormField>

                                <CalloutCard
                                    tone={isIncomingMovement ? 'success' : 'danger'}
                                    icon={isIncomingMovement ? ArrowUpRight : ArrowDownRight}
                                    title={isIncomingMovement ? 'Quantity will be added' : 'Quantity will be deducted'}
                                    description={`Current available stock: ${formatQuantity(selectedStock.quantity)} ${selectedStock.product?.unit ?? ''}`}
                                />

                                <FormField
                                    id="adjust_quantity"
                                    label="Quantity"
                                    error={adjustForm.errors.quantity}
                                    required
                                >
                                    <NumberInput
                                        id="adjust_quantity"
                                        min="0.001"
                                        max={!isIncomingMovement ? String(selectedStock.quantity) : undefined}
                                        value={adjustForm.data.quantity}
                                        disabled={adjustForm.processing || !selectedStock.is_reconciled}
                                        onValueChange={(value) => adjustForm.setData('quantity', value)}
                                    />
                                </FormField>

                                {isIncomingMovement && (
                                    <FormField
                                        id="adjust_unit_cost"
                                        label="Unit Cost"
                                        error={adjustForm.errors.unit_cost}
                                    >
                                        <MoneyInput
                                            id="adjust_unit_cost"
                                            value={adjustForm.data.unit_cost}
                                            disabled={adjustForm.processing}
                                            onValueChange={(value) => adjustForm.setData('unit_cost', value)}
                                        />
                                    </FormField>
                                )}
                            </FormSection>

                            {isIncomingMovement &&
                                selectedStock.product?.batch_tracking_enabled && (
                                    <IncomingBatchSection
                                        prefix="adjustment"
                                        product={selectedStock.product}
                                        autoGenerateCode={batchSettings.auto_generate_batch_code}
                                        values={adjustForm.data}
                                        errors={adjustForm.errors}
                                        disabled={adjustForm.processing}
                                        setValue={(key, value) => adjustForm.setData(key, value)}
                                    />
                                )}

                            {!isIncomingMovement && (
                                <OutgoingAllocationSection
                                    title="Batch Deduction"
                                    description="The deduction must resolve to eligible warehouse batch layers."
                                    product={selectedStock.product}
                                    batches={eligibleAdjustmentBatches}
                                    requestedQuantity={adjustForm.data.quantity}
                                    manual={adjustmentUsesManualAllocation}
                                    allocations={adjustForm.data.batch_allocations}
                                    allocationError={adjustForm.errors.batch_allocations}
                                    disabled={adjustForm.processing || !selectedStock.is_reconciled}
                                    onAllocationChange={updateAdjustmentAllocation}
                                />
                            )}

                            <FormSection
                                title="Audit Details"
                                description="Optional source reference and explanation."
                                icon={<Layers3 />}
                            >
                                <FormField
                                    id="reference_no"
                                    label="Reference Number"
                                    error={adjustForm.errors.reference_no}
                                >
                                    <Input
                                        id="reference_no"
                                        value={adjustForm.data.reference_no}
                                        disabled={adjustForm.processing}
                                        onChange={(event) => adjustForm.setData('reference_no', event.target.value)}
                                        placeholder="Receipt, count sheet, or document number"
                                    />
                                </FormField>

                                <FormField
                                    id="adjust_remarks"
                                    label="Remarks"
                                    error={adjustForm.errors.remarks}
                                >
                                    <Textarea
                                        id="adjust_remarks"
                                        rows={4}
                                        value={adjustForm.data.remarks}
                                        disabled={adjustForm.processing}
                                        onChange={(event) => adjustForm.setData('remarks', event.target.value)}
                                        placeholder="Explain the reason for this adjustment..."
                                        className="resize-none"
                                    />
                                </FormField>
                            </FormSection>
                        </div>

                        <AppDrawerActions
                            processing={adjustForm.processing}
                            onCancel={closeDrawer}
                            submitLabel="Post Adjustment"
                            processingLabel="Posting Adjustment..."
                        />
                    </form>
                )}
            </AppDrawer>

            {/* Transfer drawer */}
            <AppDrawer
                open={drawerType === 'transfer' && selectedStock !== null}
                onOpenChange={(open) => {
                    if (!open) closeDrawer();
                }}
                title="Transfer Stock"
                description="Move exact batch quantities to another active warehouse."
                processing={transferForm.processing}
            >
                {selectedStock && (
                    <form onSubmit={submitTransfer} className="flex min-h-full flex-col">
                        <div className="flex-1 space-y-4 p-5">
                            <StockContextCard stock={selectedStock} />

                            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-xl border border-border/60 bg-muted/[0.025] p-3">
                                <LocationBox
                                    label="Source"
                                    name={selectedStock.warehouse?.name ?? 'Warehouse'}
                                />
                                <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <ArrowRightLeft className="size-4" />
                                </div>
                                <LocationBox
                                    label="Destination"
                                    name={
                                        destinationWarehouses.find(
                                            (warehouse) =>
                                                String(warehouse.id) === transferForm.data.destination_warehouse_id,
                                        )?.name ?? 'Select warehouse'
                                    }
                                />
                            </div>

                            <FormSection
                                title="Transfer Information"
                                description="Choose the destination and total quantity to move."
                                icon={<ArrowRightLeft />}
                            >
                                <FormField
                                    id="destination_warehouse_id"
                                    label="Destination Warehouse"
                                    error={transferForm.errors.destination_warehouse_id}
                                    required
                                >
                                    <Select
                                        value={transferForm.data.destination_warehouse_id || NONE_VALUE}
                                        disabled={transferForm.processing}
                                        onValueChange={(value) =>
                                            transferForm.setData(
                                                'destination_warehouse_id',
                                                value === NONE_VALUE ? '' : value,
                                            )
                                        }
                                    >
                                        <SelectTrigger id="destination_warehouse_id">
                                            <SelectValue placeholder="Select destination" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={NONE_VALUE}>Select destination</SelectItem>
                                            {destinationWarehouses.map((warehouse) => (
                                                <SelectItem key={warehouse.id} value={String(warehouse.id)}>
                                                    {warehouse.name}{warehouse.branch ? ` — ${warehouse.branch.name}` : ''}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormField>

                                <FormField
                                    id="transfer_quantity"
                                    label="Transfer Quantity"
                                    description={`Maximum transferable: ${formatQuantity(selectedStock.quantity)} ${selectedStock.product?.unit ?? ''}`}
                                    error={transferForm.errors.quantity}
                                    required
                                >
                                    <NumberInput
                                        id="transfer_quantity"
                                        min="0.001"
                                        max={String(selectedStock.quantity)}
                                        value={transferForm.data.quantity}
                                        disabled={transferForm.processing || !selectedStock.is_reconciled}
                                        onValueChange={(value) => transferForm.setData('quantity', value)}
                                    />
                                </FormField>

                                <FormField
                                    id="transfer_reference_no"
                                    label="Reference Number"
                                    error={transferForm.errors.reference_no}
                                >
                                    <Input
                                        id="transfer_reference_no"
                                        value={transferForm.data.reference_no}
                                        disabled={transferForm.processing}
                                        onChange={(event) => transferForm.setData('reference_no', event.target.value)}
                                        placeholder="Transfer request or document number"
                                    />
                                </FormField>
                            </FormSection>

                            <OutgoingAllocationSection
                                title="Transfer Batch Allocation"
                                description="The same batch identities will be moved to the destination warehouse."
                                product={selectedStock.product}
                                batches={eligibleTransferBatches}
                                requestedQuantity={transferForm.data.quantity}
                                manual={transferUsesManualAllocation}
                                allocations={transferForm.data.batch_allocations}
                                allocationError={transferForm.errors.batch_allocations}
                                disabled={transferForm.processing || !selectedStock.is_reconciled}
                                onAllocationChange={updateTransferAllocation}
                            />

                            <FormField
                                id="transfer_remarks"
                                label="Remarks"
                                error={transferForm.errors.remarks}
                            >
                                <Textarea
                                    id="transfer_remarks"
                                    rows={4}
                                    value={transferForm.data.remarks}
                                    disabled={transferForm.processing}
                                    onChange={(event) => transferForm.setData('remarks', event.target.value)}
                                    placeholder="Reason or transfer handling notes..."
                                    className="resize-none"
                                />
                            </FormField>
                        </div>

                        <AppDrawerActions
                            processing={transferForm.processing}
                            onCancel={closeDrawer}
                            submitLabel="Transfer Stock"
                            processingLabel="Transferring Stock..."
                        />
                    </form>
                )}
            </AppDrawer>

            {/* Stock position details drawer */}
            <AppDrawer
                open={drawerType === 'batches' && selectedStock !== null}
                onOpenChange={(open) => {
                    if (!open) closeDrawer();
                }}
                title="Stock Position Details"
                description="Review balance, thresholds, valuation, batch layers, expiry exposure, and available actions."
            >
                {selectedStock && (
                    <div className="space-y-4 p-5">
                        <StockContextCard stock={selectedStock} />

                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                            <Button type="button" size="sm" onClick={() => openAdjustDrawer(selectedStock)}><ClipboardPenLine className="size-3.5" /> Adjust</Button>
                            <Button type="button" size="sm" variant="outline" disabled={warehouses.length <= 1 || Number(selectedStock.quantity) <= 0 || !selectedStock.is_reconciled} onClick={() => openTransferDrawer(selectedStock)}><ArrowRightLeft className="size-3.5" /> Transfer</Button>
                            <Button type="button" size="sm" variant="outline" onClick={() => openSettingsDrawer(selectedStock)}><Settings2 className="size-3.5" /> Settings</Button>
                            <Button type="button" size="sm" variant="outline" onClick={requestDeleteFromDetails} className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"><Trash2 className="size-3.5" /> Delete</Button>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <DetailCard label="On Hand" value={`${formatQuantity(selectedStock.quantity)} ${selectedStock.product?.unit ?? ''}`} />
                            <DetailCard label="Weighted Average Cost" value={formatCurrency(selectedStock.average_cost)} />
                            <DetailCard label="Inventory Value" value={formatCurrency(Number(selectedStock.quantity) * Number(selectedStock.average_cost))} />
                            <DetailCard label="Last Movement" value={`${formatDate(selectedStock.last_movement_at)} • ${formatTime(selectedStock.last_movement_at)}`} />
                            <DetailCard label="Reorder Level" value={formatQuantity(selectedStock.reorder_level)} />
                            <DetailCard label="Maximum Level" value={selectedStock.max_stock_level !== null ? formatQuantity(selectedStock.max_stock_level) : 'Not set'} />
                        </div>

                        <ReconciliationCard stock={selectedStock} />
                        <ProductBatchPolicyCard product={selectedStock.product} />

                        <div className="space-y-3">
                            <div><p className="text-[11px] font-semibold">Active Batch / Cost Layers</p><p className="mt-1 text-[9px] text-muted-foreground">Exact quantities, costs, source dates, and expiration status.</p></div>
                            {selectedStock.batch_stocks.length === 0 ? (
                                <CalloutCard tone="warning" icon={Layers3} title="No active batch balance" description="This position currently has no batch layer carrying an available quantity." />
                            ) : selectedStock.batch_stocks.map((batch) => (
                                <BatchBalanceCard key={batch.stock_batch_id} batch={batch} unit={selectedStock.product?.unit ?? 'unit'} />
                            ))}
                        </div>
                    </div>
                )}
            </AppDrawer>

            <AppDrawer open={overviewDrawer !== null} onOpenChange={(open) => { if (!open) closeOverviewDrawer(); }} title={overviewDrawerTitle(overviewDrawer)} description={overviewDrawerDescription(overviewDrawer)}>
                <OverviewDrawerContent type={overviewDrawer} details={overviewDetails} summary={summary} />
            </AppDrawer>

            <ConfirmDialog
                open={deleteTarget !== null}
                onOpenChange={(open) => {
                    if (!open) setDeleteTarget(null);
                }}
                title="Delete Stock Position"
                description={`Delete the empty stock position for "${deleteTarget?.product?.name ?? 'this product'}"? Any movement or batch history will prevent deletion.`}
                confirmText="Delete Stock Position"
                processing={deleteProcessing}
                destructive
                onConfirm={deleteStock}
            />
        </AppLayout>
    );
}

/*
|--------------------------------------------------------------------------
| Form sections and cards
|--------------------------------------------------------------------------
*/

function IncomingBatchSection<T extends IncomingBatchFields>({
    prefix,
    product,
    autoGenerateCode,
    values,
    errors,
    disabled,
    setValue,
}: {
    prefix: string;
    product: ProductOption | StockProduct;
    autoGenerateCode: boolean;
    values: T;
    errors: Partial<Record<keyof T, string>>;
    disabled: boolean;
    setValue: <K extends keyof T>(key: K, value: T[K]) => void;
}) {
    return (
        <FormSection
            title="Batch Identity"
            description="Create the exact cost and expiry layer for this incoming quantity."
            icon={<Package2 />}
        >
            <CalloutCard
                tone="success"
                icon={ShieldCheck}
                title={`${policyLabel(product.batch_issue_policy)} issuing policy`}
                description={
                    autoGenerateCode
                        ? 'Batch code is optional; the system will generate one when left blank.'
                        : 'A batch code is required because automatic generation is disabled.'
                }
            />

            <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                    id={`${prefix}_batch_code`}
                    label="Batch Code"
                    description={autoGenerateCode ? 'Optional / auto-generated' : undefined}
                    error={errors.batch_code}
                    required={!autoGenerateCode}
                >
                    <Input
                        id={`${prefix}_batch_code`}
                        value={values.batch_code}
                        disabled={disabled}
                        onChange={(event) => setValue('batch_code', event.target.value as T['batch_code'])}
                        placeholder={autoGenerateCode ? 'Auto-generated' : 'Enter batch code'}
                    />
                </FormField>

                <FormField
                    id={`${prefix}_lot_number`}
                    label="Lot Number"
                    description="Supplier or manufacturer lot"
                    error={errors.lot_number}
                >
                    <Input
                        id={`${prefix}_lot_number`}
                        value={values.lot_number}
                        disabled={disabled}
                        onChange={(event) => setValue('lot_number', event.target.value as T['lot_number'])}
                        placeholder="Optional lot number"
                    />
                </FormField>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <DateField
                    id={`${prefix}_received_date`}
                    label="Received Date"
                    value={values.received_date}
                    error={errors.received_date}
                    disabled={disabled}
                    onChange={(value) => setValue('received_date', value as T['received_date'])}
                />
                <DateField
                    id={`${prefix}_manufactured_date`}
                    label="Manufactured Date"
                    value={values.manufactured_date}
                    error={errors.manufactured_date}
                    disabled={disabled}
                    optional
                    onChange={(value) => setValue('manufactured_date', value as T['manufactured_date'])}
                />
                <DateField
                    id={`${prefix}_expiration_date`}
                    label="Expiration Date"
                    value={values.expiration_date}
                    error={errors.expiration_date}
                    disabled={disabled}
                    optional={!product.requires_expiration_date}
                    required={product.requires_expiration_date}
                    onChange={(value) => setValue('expiration_date', value as T['expiration_date'])}
                />
            </div>

            <FormField
                id={`${prefix}_batch_notes`}
                label="Batch Notes"
                error={errors.batch_notes}
            >
                <Textarea
                    id={`${prefix}_batch_notes`}
                    rows={3}
                    value={values.batch_notes}
                    disabled={disabled}
                    onChange={(event) => setValue('batch_notes', event.target.value as T['batch_notes'])}
                    placeholder="Condition, source, packaging, or handling notes..."
                    className="resize-none"
                />
            </FormField>
        </FormSection>
    );
}

function OutgoingAllocationSection({
    title,
    description,
    product,
    batches,
    requestedQuantity,
    manual,
    allocations,
    allocationError,
    disabled,
    onAllocationChange,
}: {
    title: string;
    description: string;
    product: StockProduct | null;
    batches: BatchStock[];
    requestedQuantity: string;
    manual: boolean;
    allocations: BatchAllocationInput[];
    allocationError?: string;
    disabled: boolean;
    onAllocationChange: (stockBatchId: number, quantity: string) => void;
}) {
    const allocatedTotal = allocations.reduce(
        (total, allocation) =>
            total + Number(allocation.quantity || 0),
        0,
    );

    const requested = Number(requestedQuantity || 0);

    return (
        <FormSection
            title={title}
            description={description}
            icon={<Layers3 />}
        >
            <CalloutCard
                tone={manual ? 'warning' : 'success'}
                icon={manual ? ClipboardPenLine : ShieldCheck}
                title={
                    manual
                        ? 'Manual batch allocation required'
                        : `${policyLabel(product?.batch_issue_policy ?? 'fifo')} allocation will be applied`
                }
                description={
                    manual
                        ? 'Enter batch quantities whose total exactly matches the requested movement quantity.'
                        : 'The server will lock eligible batches and allocate in the configured order during posting.'
                }
            />

            {allocationError && (
                <p className="text-[11px] font-medium text-red-400">
                    {allocationError}
                </p>
            )}

            {batches.length === 0 ? (
                <CalloutCard
                    tone="danger"
                    icon={AlertOctagon}
                    title="No eligible batch quantity"
                    description="No active warehouse batch can satisfy this movement type."
                />
            ) : (
                <div className="space-y-2">
                    {batches.map((batch, index) => {
                        const allocation = allocations.find(
                            (item) =>
                                Number(item.stock_batch_id) ===
                                batch.stock_batch_id,
                        );

                        return (
                            <div
                                key={batch.stock_batch_id}
                                className="rounded-xl border border-border/60 bg-background/30 p-3"
                            >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-[11px] font-semibold">
                                                {batch.batch_code}
                                            </span>
                                            {!manual && (
                                                <Badge
                                                    variant="outline"
                                                    className="h-5 rounded-full px-2 text-[8px]"
                                                >
                                                    Priority {index + 1}
                                                </Badge>
                                            )}
                                            <ExpiryBadge batch={batch} />
                                        </div>
                                        <p className="mt-1 text-[9px] text-muted-foreground">
                                            Available {formatQuantity(batch.quantity)} · {formatCurrency(batch.unit_cost)} per unit
                                        </p>
                                        <p className="mt-1 text-[9px] text-muted-foreground">
                                            Received {formatShortDate(batch.received_date)} · Expiry {formatShortDate(batch.expiration_date)}
                                        </p>
                                    </div>

                                    {manual && (
                                        <div className="w-full sm:w-36">
                                            <NumberInput
                                                id={`allocation_${batch.stock_batch_id}`}
                                                min="0"
                                                max={String(batch.quantity)}
                                                value={allocation?.quantity ?? ''}
                                                disabled={disabled}
                                                placeholder="0"
                                                onValueChange={(value) =>
                                                    onAllocationChange(batch.stock_batch_id, value)
                                                }
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {manual && (
                <div
                    className={cn(
                        'flex items-center justify-between rounded-xl border px-3 py-2.5 text-[10px]',
                        Math.abs(allocatedTotal - requested) <= 0.0001 && requested > 0
                            ? 'border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-300'
                            : 'border-amber-500/20 bg-amber-500/[0.06] text-amber-300',
                    )}
                >
                    <span>Allocated total</span>
                    <span className="font-semibold tabular-nums">
                        {formatQuantity(allocatedTotal)} / {formatQuantity(requested)}
                    </span>
                </div>
            )}
        </FormSection>
    );
}

function ProductBatchPolicyCard({
    product,
}: {
    product: ProductOption | StockProduct | null;
}) {
    if (!product) {
        return null;
    }

    return (
        <div className="rounded-xl border border-primary/15 bg-primary/[0.04] p-3.5">
            <div className="flex items-start gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                    <Layers3 className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[11px] font-semibold">
                            {product.batch_tracking_enabled
                                ? 'Batch-managed product'
                                : 'Standard tracked product'}
                        </p>
                        <Badge
                            variant="outline"
                            className="h-5 rounded-full border-primary/20 bg-primary/[0.06] px-2 text-[8px] font-semibold text-primary"
                        >
                            {policyLabel(product.batch_issue_policy)}
                        </Badge>
                    </div>
                    <p className="mt-1.5 text-[9px] leading-4 text-muted-foreground">
                        {product.batch_tracking_enabled
                            ? `Outgoing quantities follow ${policyLabel(product.batch_issue_policy)} allocation.${product.requires_expiration_date ? ' Expiration date is required for every incoming batch.' : ''}`
                            : 'The system still creates internal cost layers to keep warehouse totals and valuation reconciled, but batch identity fields are hidden.'}
                    </p>
                </div>
            </div>
        </div>
    );
}

function StockContextCard({
    stock,
}: {
    stock: WarehouseStock;
}) {
    return (
        <ContextCard
            icon={<Package2 />}
            title={stock.product?.name ?? 'Unknown product'}
            subtitle={
                <>
                    {stock.warehouse?.name ?? 'Unknown warehouse'}
                    {stock.warehouse?.branch
                        ? ` • ${stock.warehouse.branch.name}`
                        : ''}
                </>
            }
            metrics={[
                {
                    label: 'Current Quantity',
                    value: `${formatQuantity(stock.quantity)} ${stock.product?.unit ?? ''}`,
                },
                {
                    label: 'Average Cost',
                    value: formatCurrency(stock.average_cost),
                },
                {
                    label: 'Batch Layers',
                    value: formatNumber(stock.batch_count),
                },
                {
                    label: 'Reconciled',
                    value: stock.is_reconciled ? 'Yes' : 'No',
                },
            ]}
        />
    );
}

function ReconciliationCard({
    stock,
}: {
    stock: WarehouseStock;
}) {
    return (
        <div
            className={cn(
                'rounded-xl border p-3.5',
                stock.is_reconciled
                    ? 'border-emerald-500/20 bg-emerald-500/[0.055]'
                    : 'border-red-500/20 bg-red-500/[0.055]',
            )}
        >
            <div className="flex items-start gap-3">
                {stock.is_reconciled ? (
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                ) : (
                    <AlertOctagon className="mt-0.5 size-4 shrink-0 text-red-400" />
                )}
                <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold">
                        {stock.is_reconciled
                            ? 'Warehouse and batch totals match'
                            : 'Reconciliation mismatch detected'}
                    </p>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-[9px]">
                        <MetricChip label="Aggregate" value={formatQuantity(stock.quantity)} />
                        <MetricChip label="Batch Total" value={formatQuantity(stock.batch_quantity)} />
                        <MetricChip label="Difference" value={formatQuantity(stock.reconciliation_difference)} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function BatchBalanceCard({
    batch,
    unit,
}: {
    batch: BatchStock;
    unit: string;
}) {
    return (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-background/30">
            <div className="flex flex-col gap-2 border-b border-border/50 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[12px] font-semibold">
                            {batch.batch_code}
                        </p>
                        <ExpiryBadge batch={batch} />
                        <Badge variant="outline" className="h-5 rounded-full px-2 text-[8px]">
                            {humanize(batch.batch_status)}
                        </Badge>
                    </div>
                    <p className="mt-1 text-[9px] text-muted-foreground">
                        {batch.lot_number ? `Lot ${batch.lot_number} · ` : ''}{humanize(batch.source_type)}
                    </p>
                </div>

                <div className="text-left sm:text-right">
                    <p className="text-lg font-semibold leading-none tabular-nums text-primary">
                        {formatQuantity(batch.quantity)}
                    </p>
                    <p className="mt-1 text-[9px] text-muted-foreground">
                        {unit} available
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-px bg-border/50 sm:grid-cols-4">
                <BatchMetric label="Unit Cost" value={formatCurrency(batch.unit_cost)} />
                <BatchMetric label="Batch Value" value={formatCurrency(batch.batch_value)} />
                <BatchMetric label="Received" value={formatShortDate(batch.received_date)} />
                <BatchMetric label="Expiration" value={formatShortDate(batch.expiration_date)} />
            </div>
        </div>
    );
}

function DateField({
    id,
    label,
    value,
    error,
    disabled,
    optional,
    required,
    onChange,
}: {
    id: string;
    label: string;
    value: string;
    error?: string;
    disabled: boolean;
    optional?: boolean;
    required?: boolean;
    onChange: (value: string) => void;
}) {
    return (
        <FormField
            id={id}
            label={label}
            description={optional ? 'Optional' : undefined}
            error={error}
            required={required}
        >
            <Input
                id={id}
                type="date"
                value={value}
                disabled={disabled}
                onChange={(event) => onChange(event.target.value)}
            />
        </FormField>
    );
}

/*
|--------------------------------------------------------------------------
| Small UI helpers
|--------------------------------------------------------------------------
*/

function StockRowButton({
    stock,
    onOpen,
    label,
    children,
}: {
    stock: WarehouseStock;
    onOpen: (stock: WarehouseStock) => void;
    label: string;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={() => onOpen(stock)}
            aria-label={label}
            className="group/stock-row block w-full rounded-lg p-1.5 text-left outline-none transition hover:bg-primary/[0.055] focus-visible:ring-2 focus-visible:ring-primary/40"
        >
            {children}
        </button>
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
        { icon: string; value: string; glow: string }
    > = {
        primary: {
            icon: 'border-primary/20 bg-primary/10 text-primary',
            value: 'text-primary',
            glow: 'bg-primary/10',
        },
        emerald: {
            icon: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
            value: 'text-emerald-400',
            glow: 'bg-emerald-500/10',
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
                'group relative min-w-0 overflow-hidden p-4 text-left transition-colors hover:bg-primary/[0.035] focus:outline-none focus:ring-2 focus:ring-primary/20',
                className,
            )}
        >
            <div className={cn('pointer-events-none absolute -bottom-12 -right-12 size-28 rounded-full blur-3xl', styles.glow)} />
            <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                        {title}
                    </p>
                    <p className={cn('mt-2 text-xl font-semibold leading-none tabular-nums', styles.value)}>
                        {value}
                    </p>
                    <p className="mt-2 text-[9px] leading-4 text-muted-foreground">
                        {description}
                    </p>
                </div>
                <span className={cn('inline-flex size-8 shrink-0 items-center justify-center rounded-lg border', styles.icon)}>
                    <Icon className="size-4" />
                </span>
            </div>
        </button>
    );
}

function MiniToneBadge({
    tone,
    children,
}: {
    tone: 'emerald' | 'amber' | 'red';
    children: ReactNode;
}) {
    const classes = {
        emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
        amber: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
        red: 'border-red-500/20 bg-red-500/10 text-red-300',
    };

    return (
        <span className={cn('inline-flex h-5 items-center rounded-full border px-2 text-[8px] font-semibold', classes[tone])}>
            {children}
        </span>
    );
}

function ExpiryBadge({ batch }: { batch: BatchStock }) {
    const details = getExpiryDetails(batch);

    return (
        <Badge
            variant="outline"
            className={cn('h-5 rounded-full px-2 text-[8px] font-semibold', details.className)}
        >
            {details.label}
        </Badge>
    );
}

function OverviewExpiryBadge({
    state,
    days,
}: {
    state: ExpiryState;
    days: number | null;
}) {
    const label = state === 'expired'
        ? `Expired${days !== null ? ` ${Math.abs(days)}d` : ''}`
        : state === 'critical'
          ? `${days ?? 0}d critical`
          : state === 'warning'
            ? `${days ?? 0}d remaining`
            : state === 'safe'
              ? `${days ?? 0}d safe`
              : 'No expiry';

    const className = state === 'expired'
        ? 'border-red-500/20 bg-red-500/10 text-red-300'
        : state === 'critical'
          ? 'border-orange-500/20 bg-orange-500/10 text-orange-300'
          : state === 'warning'
            ? 'border-amber-500/20 bg-amber-500/10 text-amber-300'
            : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300';

    return (
        <Badge variant="outline" className={cn('h-5 rounded-full px-2 text-[8px] font-semibold', className)}>
            {label}
        </Badge>
    );
}

function MetricChip({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-lg border border-border/50 bg-background/40 px-2.5 py-2">
            <p className="text-[8px] uppercase tracking-wider text-muted-foreground">
                {label}
            </p>
            <p className="mt-1 font-semibold tabular-nums">
                {value}
            </p>
        </div>
    );
}

function BatchMetric({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="bg-background/40 px-3 py-2.5">
            <p className="text-[8px] uppercase tracking-wider text-muted-foreground">
                {label}
            </p>
            <p className="mt-1 text-[10px] font-semibold tabular-nums">
                {value}
            </p>
        </div>
    );
}

function LocationBox({
    label,
    name,
}: {
    label: string;
    name: string;
}) {
    return (
        <div className="min-w-0 rounded-lg border border-border/50 bg-background/60 p-3 text-center">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                {label}
            </p>
            <p className="mt-1 truncate text-[11px] font-semibold">
                {name}
            </p>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Data helpers
|--------------------------------------------------------------------------
*/

function makeAllocationInputs(
    batches: BatchStock[],
): BatchAllocationInput[] {
    return batches.map((batch) => ({
        stock_batch_id: String(batch.stock_batch_id),
        quantity: '',
    }));
}

function updateAllocationInput(
    allocations: BatchAllocationInput[],
    stockBatchId: number,
    quantity: string,
): BatchAllocationInput[] {
    const id = String(stockBatchId);
    const exists = allocations.some(
        (allocation) =>
            allocation.stock_batch_id === id,
    );

    if (!exists) {
        return [
            ...allocations,
            { stock_batch_id: id, quantity },
        ];
    }

    return allocations.map((allocation) =>
        allocation.stock_batch_id === id
            ? { ...allocation, quantity }
            : allocation,
    );
}

function FilterSelectField({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="space-y-1.5">
            <p className="px-1 text-[9px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">{label}</p>
            {children}
        </div>
    );
}

function DetailCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-border/60 bg-background/35 p-3">
            <p className="text-[9px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">{label}</p>
            <p className="mt-1.5 text-[12px] font-semibold tabular-nums">{value}</p>
        </div>
    );
}

function overviewDrawerTitle(type: OverviewDrawerType): string {
    if (type === 'positions') return 'Inventory Positions Overview';
    if (type === 'quantity') return 'Quantity by Warehouse';
    if (type === 'batches') return 'Active Batch Layers';
    if (type === 'expiry') return 'Expiring and Expired Batches';
    if (type === 'health') return 'Inventory Health Breakdown';
    return 'Inventory Overview';
}

function overviewDrawerDescription(type: OverviewDrawerType): string {
    if (type === 'positions') return 'Product-location balances with status, valuation, and active layer counts.';
    if (type === 'quantity') return 'Combined quantity and valuation grouped by warehouse.';
    if (type === 'batches') return 'Available batch and cost layers across active warehouses.';
    if (type === 'expiry') return 'Batches inside the warning window or already expired.';
    if (type === 'health') return 'Healthy, low-stock, unavailable, expired, and reconciliation conditions.';
    return '';
}

function OverviewDrawerContent({ type, details, summary }: { type: OverviewDrawerType; details: OverviewDetails; summary: StockSummary }) {
    if (!type) return null;

    if (type === 'positions') {
        return <div className="space-y-3 p-5">{details.positions.length === 0 ? <CalloutCard tone="warning" icon={Layers3} title="No positions" description="No inventory positions are available." /> : details.positions.map((item) => (
            <div key={item.id} className="rounded-xl border border-border/60 bg-background/35 p-3">
                <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-[12px] font-semibold">{item.product_name}</p><p className="mt-1 text-[9px] text-muted-foreground">{item.sku ?? 'No SKU'} • {item.warehouse_name} • {item.branch_name ?? 'No branch'}</p></div><StatusBadge label={item.stock_status === 'healthy' ? 'In stock' : item.stock_status === 'low_stock' ? 'Low stock' : 'Out of stock'} variant={item.stock_status === 'healthy' ? 'success' : item.stock_status === 'low_stock' ? 'warning' : 'danger'} /></div>
                <div className="mt-3 grid grid-cols-3 gap-2"><DetailCard label="Quantity" value={`${formatQuantity(item.quantity)} ${item.unit}`} /><DetailCard label="Layers" value={formatNumber(item.batch_count)} /><DetailCard label="Value" value={formatCurrency(item.total_value)} /></div>
            </div>
        ))}</div>;
    }

    if (type === 'quantity') {
        return <div className="space-y-3 p-5">{details.warehouses.map((item) => (
            <div key={item.warehouse_id} className="rounded-xl border border-border/60 bg-background/35 p-4"><div className="flex items-center gap-2"><WarehouseIcon className="size-4 text-primary" /><p className="text-[12px] font-semibold">{item.warehouse_name}</p></div><p className="mt-1 text-[9px] text-muted-foreground">{item.branch_name ?? 'No branch'} • {item.position_count} positions</p><div className="mt-3 grid grid-cols-2 gap-2"><DetailCard label="Available Quantity" value={formatQuantity(item.total_quantity)} /><DetailCard label="Inventory Value" value={formatCurrency(item.total_value)} /></div></div>
        ))}</div>;
    }

    if (type === 'batches') {
        return <div className="space-y-3 p-5">{details.batches.length === 0 ? <CalloutCard tone="warning" icon={Package2} title="No active batches" description="No batch layer currently carries available quantity." /> : details.batches.map((item) => (
            <div key={`${item.stock_batch_id}-${item.warehouse_id}`} className="rounded-xl border border-border/60 bg-background/35 p-3"><div className="flex items-start justify-between gap-3"><div><p className="text-[12px] font-semibold">{item.product_name}</p><p className="mt-1 text-[9px] text-muted-foreground">{item.batch_code} • {item.warehouse_name}</p></div><OverviewExpiryBadge state={item.expiry_state} days={item.days_to_expiry} /></div><div className="mt-3 grid grid-cols-3 gap-2"><DetailCard label="Quantity" value={formatQuantity(item.quantity)} /><DetailCard label="Unit Cost" value={formatCurrency(item.unit_cost)} /><DetailCard label="Layer Value" value={formatCurrency(item.batch_value)} /></div></div>
        ))}</div>;
    }

    if (type === 'expiry') {
        return <div className="space-y-3 p-5">{details.expiry.length === 0 ? <CalloutCard tone="success" icon={CheckCircle2} title="No expiry exposure" description="No active batch is inside the warning window or expired." /> : details.expiry.map((item) => (
            <div key={`${item.stock_batch_id}-${item.warehouse_name}`} className="rounded-xl border border-border/60 bg-background/35 p-3"><div className="flex items-start justify-between gap-3"><div><p className="text-[12px] font-semibold">{item.product_name}</p><p className="mt-1 text-[9px] text-muted-foreground">{item.batch_code} • {item.warehouse_name}</p></div><OverviewExpiryBadge state={item.expiry_state} days={item.days_to_expiry} /></div><p className="mt-3 text-[10px] text-muted-foreground">Expiration: <span className="font-semibold text-foreground">{formatDate(item.expiration_date)}</span> • Quantity: <span className="font-semibold text-foreground">{formatQuantity(item.quantity)}</span></p></div>
        ))}</div>;
    }

    return <div className="space-y-4 p-5"><div className="grid grid-cols-2 gap-2">{details.health.map((item) => <DetailCard key={item.key} label={item.label} value={formatNumber(item.count)} />)}</div><CalloutCard tone={summary.reconciliation_mismatches > 0 || summary.expired_batches > 0 ? 'danger' : summary.low_stock > 0 || summary.out_of_stock > 0 ? 'warning' : 'success'} icon={summary.reconciliation_mismatches > 0 || summary.expired_batches > 0 ? AlertOctagon : summary.low_stock > 0 || summary.out_of_stock > 0 ? TriangleAlert : CheckCircle2} title={summary.reconciliation_mismatches > 0 ? 'Reconciliation requires attention' : summary.expired_batches > 0 ? 'Expired stock remains available' : summary.low_stock > 0 || summary.out_of_stock > 0 ? 'Replenishment action is needed' : 'Inventory health is stable'} description="Use the inventory directory filters to review affected product-location positions." /></div>;
}

function getStockStatus(
    stock: WarehouseStock,
): {
    label: string;
    variant: 'success' | 'warning' | 'danger';
    progressClass: string;
} {
    const quantity = Number(stock.quantity ?? 0);
    const reorderLevel = Number(stock.reorder_level ?? 0);

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

function getStockPercentage(stock: WarehouseStock): number {
    const quantity = Number(stock.quantity ?? 0);
    const maximum = Number(stock.max_stock_level ?? 0);
    const reorder = Number(stock.reorder_level ?? 0);

    if (maximum > 0) {
        return Math.min(
            100,
            Math.max(0, (quantity / maximum) * 100),
        );
    }

    if (quantity <= 0) return 0;
    if (reorder > 0 && quantity <= reorder) return 35;
    return 75;
}

function getExpiryDetails(batch: BatchStock): {
    label: string;
    className: string;
} {
    switch (batch.expiry_state) {
        case 'expired':
            return {
                label: 'Expired',
                className: 'border-red-500/20 bg-red-500/10 text-red-300',
            };
        case 'critical':
            return {
                label: batch.days_to_expiry !== null
                    ? `${batch.days_to_expiry}d critical`
                    : 'Critical',
                className: 'border-red-500/20 bg-red-500/10 text-red-300',
            };
        case 'warning':
            return {
                label: batch.days_to_expiry !== null
                    ? `${batch.days_to_expiry}d left`
                    : 'Expiring',
                className: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
            };
        case 'safe':
            return {
                label: 'Expiry safe',
                className: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
            };
        default:
            return {
                label: 'No expiry',
                className: 'border-slate-500/20 bg-slate-500/10 text-slate-300',
            };
    }
}

function policyLabel(policy: BatchIssuePolicy): string {
    return policy === 'fefo'
        ? 'FEFO'
        : policy === 'manual'
          ? 'Manual'
          : 'FIFO';
}

function humanize(value: string): string {
    return value
        .replaceAll('_', ' ')
        .replace(/\b\w/g, (character) =>
            character.toUpperCase(),
        );
}

function todayInputValue(): string {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const local = new Date(
        now.getTime() - offset * 60_000,
    );

    return local.toISOString().slice(0, 10);
}

function formatCurrency(
    value: string | number | null,
): string {
    const amount = Number(value ?? 0);

    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    }).format(Number.isFinite(amount) ? amount : 0);
}

function formatQuantity(
    value: string | number | null,
): string {
    const quantity = Number(value ?? 0);

    return new Intl.NumberFormat('en-PH', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 3,
    }).format(Number.isFinite(quantity) ? quantity : 0);
}

function formatNumber(
    value: string | number | null,
): string {
    const amount = Number(value ?? 0);

    return new Intl.NumberFormat('en-PH').format(
        Number.isFinite(amount) ? amount : 0,
    );
}

function formatDate(value: string | null): string {
    if (!value) return 'No movement';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Invalid date';

    return new Intl.DateTimeFormat('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(date);
}

function formatTime(value: string | null): string {
    if (!value) return 'Waiting for activity';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    return new Intl.DateTimeFormat('en-PH', {
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
}

function formatShortDate(value: string | null): string {
    if (!value) return 'Not set';

    const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value)
        ? `${value}T00:00:00`
        : value;

    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(date);
}