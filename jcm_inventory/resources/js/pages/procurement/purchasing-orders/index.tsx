import { ActionGroup } from "@/components/shared/action-group";
import { AppPagination } from "@/components/shared/app-pagination";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EntityAvatar } from "@/components/shared/entity-avatar";
import { FilterBar } from "@/components/shared/filter-bar";
import { FormDialog } from "@/components/shared/form-dialog";
import { FormField } from "@/components/shared/form-field";
import { FormSection } from "@/components/shared/form-section";
import { IconButton } from "@/components/shared/icon-button";
import { IconInput } from "@/components/shared/icon-input";
import { PageContainer } from "@/components/shared/page-container";
import { SearchInput } from "@/components/shared/search-input";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/layouts/app-layout";
import { cn } from "@/lib/utils";
import { type BreadcrumbItem } from "@/types";
import { Head, router, useForm } from "@inertiajs/react";
import {
  Banknote,
  Ban,
  Boxes,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  FilePenLine,
  PackageCheck,
  PackageOpen,
  Pencil,
  Plus,
  RotateCcw,
  Send,
  ShieldCheck,
  ShoppingCart,
  Trash2,
  Truck,
  UserRound,
  Warehouse,
  type LucideIcon,
} from "lucide-react";
import {
  Fragment,
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type UserReference = {
  id: number;
  name: string;
  email: string | null;
};

type SupplierOption = {
  id: number;
  code: string;
  name: string;
  contact_person: string | null;
  payment_terms: string | null;
};

type BranchOption = {
  id: number;
  code: string;
  name: string;
  is_main: boolean;
};

type WarehouseOption = {
  id: number;
  branch_id: number;
  code: string;
  name: string;
  is_main: boolean;
};

type ProductOption = {
  id: number;
  name: string;
  sku: string | null;
  barcode: string | null;
  unit: string;
  cost_price: number;
};

type StatusOption = {
  value: string;
  label: string;
};

type PurchaseOrderItem = {
  id: number;
  product_id: number;
  product_name: string;
  product_sku: string | null;
  unit: string;
  quantity: number;
  received_quantity: number;
  unit_cost: number;
  line_total: number;
  notes: string | null;
};

type PurchaseOrder = {
  id: number;
  po_number: string;

  supplier: {
    id: number;
    name: string;
    code: string | null;
    contact_person: string | null;
  };

  branch: {
    id: number;
    name: string;
    code: string | null;
  };

  warehouse: {
    id: number;
    name: string;
    code: string | null;
  };

  order_date: string;
  expected_delivery_date: string | null;

  status: string;
  status_label: string;

  payment_terms: string | null;

  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  shipping_amount: number;
  total_amount: number;

  notes: string | null;

  items_count: number;
  ordered_quantity: number;
  received_quantity: number;

  items?: PurchaseOrderItem[];

  created_by: UserReference | null;
  submitted_by: UserReference | null;
  submitted_at: string | null;
  approved_by: UserReference | null;
  approved_at: string | null;
  cancelled_by: UserReference | null;
  cancelled_at: string | null;

  created_at: string | null;
  updated_at: string | null;
};

type PaginationLink = {
  url: string | null;
  label: string;
  active: boolean;
};

type PaginatedPurchaseOrders = {
  current_page: number;
  data: PurchaseOrder[];
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

type PurchaseOrderSummary = {
  total: number;
  draft: number;
  pending: number;
  approved: number;
  partially_received: number;
  received: number;
  cancelled: number;
  total_value: number;
};

type PurchaseOrderFilters = {
  search: string;
  status: string;
  supplier_id: string;
  warehouse_id: string;
  date_from: string;
  date_to: string;
};

type PurchaseOrderFormItem = {
  product_id: string;
  quantity: string;
  unit_cost: string;
  notes: string;
};

type PurchaseOrderFormData = {
  supplier_id: string;
  branch_id: string;
  warehouse_id: string;
  order_date: string;
  expected_delivery_date: string;
  payment_terms: string;
  discount_amount: string;
  tax_amount: string;
  shipping_amount: string;
  notes: string;
  items: PurchaseOrderFormItem[];
};

type PurchaseOrderViewer = {
  user_id: number;
  account_owner_id: number;
  role_code: string;
  role_name: string;
  is_owner: boolean;
  can_submit_for_approval: boolean;
};

type PurchaseOrderPageProps = {
  purchase_orders: PaginatedPurchaseOrders;
  summary: PurchaseOrderSummary;
  suppliers: SupplierOption[];
  branches: BranchOption[];
  warehouses: WarehouseOption[];
  products: ProductOption[];
  statuses: StatusOption[];
  filters: PurchaseOrderFilters;
  viewer: PurchaseOrderViewer;
};

type OrderAction = "submit";

type OrderActionTarget = {
  order: PurchaseOrder;
  action: OrderAction;
};

/*
|--------------------------------------------------------------------------
| Configuration
|--------------------------------------------------------------------------
*/

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
  },
  {
    title: "Suppliers",
    href: "/suppliers",
  },
  {
    title: "Purchase Orders",
    href: "/suppliers/purchase-orders",
  },
];

const ALL_VALUE = "all";
const NONE_VALUE = "none";

function todayDate(): string {
  const date = new Date();
  const timezoneOffset = date.getTimezoneOffset() * 60_000;

  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function emptyItem(): PurchaseOrderFormItem {
  return {
    product_id: "",
    quantity: "1",
    unit_cost: "",
    notes: "",
  };
}

function emptyOrderForm(): PurchaseOrderFormData {
  return {
    supplier_id: "",
    branch_id: "",
    warehouse_id: "",
    order_date: todayDate(),
    expected_delivery_date: "",
    payment_terms: "",
    discount_amount: "",
    tax_amount: "",
    shipping_amount: "",
    notes: "",
    items: [emptyItem()],
  };
}

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function PurchaseOrderIndex({
  purchase_orders,
  summary,
  suppliers,
  branches,
  warehouses,
  products,
  statuses,
  filters,
  viewer,
}: PurchaseOrderPageProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [expandedPurchaseOrderId, setExpandedPurchaseOrderId] = useState<
    number | null
  >(null);

  const [editingPurchaseOrder, setEditingPurchaseOrder] =
    useState<PurchaseOrder | null>(null);

  const [actionTarget, setActionTarget] = useState<OrderActionTarget | null>(
    null,
  );

  const [actionProcessing, setActionProcessing] = useState(false);

  const [search, setSearch] = useState(filters.search ?? "");

  const [status, setStatus] = useState(filters.status ?? "");

  const [supplierId, setSupplierId] = useState(filters.supplier_id ?? "");

  const [warehouseId, setWarehouseId] = useState(filters.warehouse_id ?? "");

  const [dateFrom, setDateFrom] = useState(filters.date_from ?? "");

  const [dateTo, setDateTo] = useState(filters.date_to ?? "");

  const form = useForm<PurchaseOrderFormData>(emptyOrderForm());

  useEffect(() => {
    setSearch(filters.search ?? "");
    setStatus(filters.status ?? "");
    setSupplierId(filters.supplier_id ?? "");
    setWarehouseId(filters.warehouse_id ?? "");
    setDateFrom(filters.date_from ?? "");
    setDateTo(filters.date_to ?? "");
  }, [
    filters.search,
    filters.status,
    filters.supplier_id,
    filters.warehouse_id,
    filters.date_from,
    filters.date_to,
  ]);

  /*
    |--------------------------------------------------------------------------
    | Derived form values
    |--------------------------------------------------------------------------
    */

  const modalWarehouses = useMemo(() => {
    if (!form.data.branch_id) {
      return [];
    }

    return warehouses.filter(
      (warehouse) => String(warehouse.branch_id) === form.data.branch_id,
    );
  }, [form.data.branch_id, warehouses]);

  const formSubtotal = useMemo(() => {
    return form.data.items.reduce((total, item) => {
      const quantity = Number(item.quantity || 0);

      const unitCost = Number(item.unit_cost || 0);

      if (!Number.isFinite(quantity) || !Number.isFinite(unitCost)) {
        return total;
      }

      return total + quantity * unitCost;
    }, 0);
  }, [form.data.items]);

  const formDiscount = Number(form.data.discount_amount || 0);

  const formTax = Number(form.data.tax_amount || 0);

  const formShipping = Number(form.data.shipping_amount || 0);

  const formTotal =
    formSubtotal -
    (Number.isFinite(formDiscount) ? formDiscount : 0) +
    (Number.isFinite(formTax) ? formTax : 0) +
    (Number.isFinite(formShipping) ? formShipping : 0);

  /*
    |--------------------------------------------------------------------------
    | Dialog actions
    |--------------------------------------------------------------------------
    */

  function resetPurchaseOrderForm(): void {
    form.clearErrors();
    form.setData(emptyOrderForm());
  }

  function resetAndCloseDialog(): void {
    setIsDialogOpen(false);
    setEditingPurchaseOrder(null);
    resetPurchaseOrderForm();
  }

  function closeDialog(): void {
    if (form.processing) {
      return;
    }

    resetAndCloseDialog();
  }

  function handleDialogOpenChange(open: boolean): void {
    if (open) {
      setIsDialogOpen(true);
      return;
    }

    closeDialog();
  }

  function openCreateDialog(): void {
    setEditingPurchaseOrder(null);
    resetPurchaseOrderForm();
    setIsDialogOpen(true);
  }

  function openEditDialog(purchaseOrder: PurchaseOrder): void {
    if (!purchaseOrder.items || purchaseOrder.items.length === 0) {
      window.alert(
        "Purchase order item details are not included in the controller response.",
      );

      return;
    }

    setEditingPurchaseOrder(purchaseOrder);
    form.clearErrors();

    form.setData({
      supplier_id: String(purchaseOrder.supplier.id),
      branch_id: String(purchaseOrder.branch.id),
      warehouse_id: String(purchaseOrder.warehouse.id),
      order_date: purchaseOrder.order_date,
      expected_delivery_date: purchaseOrder.expected_delivery_date ?? "",
      payment_terms: purchaseOrder.payment_terms ?? "",
      discount_amount: String(purchaseOrder.discount_amount),
      tax_amount: String(purchaseOrder.tax_amount),
      shipping_amount: String(purchaseOrder.shipping_amount),
      notes: purchaseOrder.notes ?? "",
      items: purchaseOrder.items.map((item) => ({
        product_id: String(item.product_id),
        quantity: String(item.quantity),
        unit_cost: String(item.unit_cost),
        notes: item.notes ?? "",
      })),
    });

    setIsDialogOpen(true);
  }

  function submitPurchaseOrder(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (editingPurchaseOrder) {
      form.put(`/suppliers/purchase-orders/${editingPurchaseOrder.id}`, {
        preserveScroll: true,
        onSuccess: resetAndCloseDialog,
      });

      return;
    }

    form.post("/suppliers/purchase-orders", {
      preserveScroll: true,
      onSuccess: resetAndCloseDialog,
    });
  }

  /*
    |--------------------------------------------------------------------------
    | Form field actions
    |--------------------------------------------------------------------------
    */

  function changeSupplier(value: string): void {
    const supplier = suppliers.find((item) => String(item.id) === value);

    form.setData({
      ...form.data,
      supplier_id: value,
      payment_terms: supplier?.payment_terms ?? form.data.payment_terms,
    });
  }

  function changeBranch(value: string): void {
    const selectedWarehouse = warehouses.find(
      (warehouse) => String(warehouse.id) === form.data.warehouse_id,
    );

    const warehouseBelongsToBranch =
      selectedWarehouse && String(selectedWarehouse.branch_id) === value;

    form.setData({
      ...form.data,
      branch_id: value,
      warehouse_id: warehouseBelongsToBranch ? form.data.warehouse_id : "",
    });
  }

  function addItem(): void {
    form.setData("items", [...form.data.items, emptyItem()]);
  }

  function removeItem(index: number): void {
    if (form.data.items.length === 1) {
      form.setData("items", [emptyItem()]);
      return;
    }

    form.setData(
      "items",
      form.data.items.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  function updateItem(
    index: number,
    field: keyof PurchaseOrderFormItem,
    value: string,
  ): void {
    const items = [...form.data.items];

    items[index] = {
      ...items[index],
      [field]: value,
    };

    form.setData("items", items);
  }

  function changeItemProduct(index: number, productId: string): void {
    const product = products.find((item) => String(item.id) === productId);

    const items = [...form.data.items];

    items[index] = {
      ...items[index],
      product_id: productId,
      unit_cost: product ? String(product.cost_price) : "",
    };

    form.setData("items", items);
  }

  function itemError(
    index: number,
    field: keyof PurchaseOrderFormItem,
  ): string | undefined {
    return (form.errors as Record<string, string>)[`items.${index}.${field}`];
  }

  /*
    |--------------------------------------------------------------------------
    | Filters
    |--------------------------------------------------------------------------
    */

  function applyFilters(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    router.get(
      "/suppliers/purchase-orders",
      {
        search: search.trim() || undefined,
        status: status || undefined,
        supplier_id: supplierId || undefined,
        warehouse_id: warehouseId || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      },
      {
        preserveState: true,
        preserveScroll: true,
        replace: true,
      },
    );
  }

  function resetFilters(): void {
    setSearch("");
    setStatus("");
    setSupplierId("");
    setWarehouseId("");
    setDateFrom("");
    setDateTo("");
    setExpandedPurchaseOrderId(null);

    router.get(
      "/suppliers/purchase-orders",
      {},
      {
        preserveState: true,
        preserveScroll: true,
        replace: true,
      },
    );
  }

  function togglePurchaseOrderDetails(purchaseOrderId: number): void {
    setExpandedPurchaseOrderId((currentId) =>
      currentId === purchaseOrderId ? null : purchaseOrderId,
    );
  }

  /*
    |--------------------------------------------------------------------------
    | Workflow actions
    |--------------------------------------------------------------------------
    */

  function requestOrderAction(order: PurchaseOrder, action: OrderAction): void {
    setActionTarget({
      order,
      action,
    });
  }

  function executeOrderAction(): void {
    if (!actionTarget || actionProcessing) {
      return;
    }

    const { order, action } = actionTarget;

    const options = {
      preserveScroll: true,
      onStart: () => setActionProcessing(true),
      onSuccess: () => setActionTarget(null),
      onFinish: () => setActionProcessing(false),
    };

    router.post(
      `/suppliers/purchase-orders/${order.id}/${action}`,
      {},
      options,
    );
  }

  /*
    |--------------------------------------------------------------------------
    | Derived procurement values
    |--------------------------------------------------------------------------
    */

  const openOrders =
    summary.draft +
    summary.pending +
    summary.approved +
    summary.partially_received;

  const openShare =
    summary.total > 0 ? Math.round((openOrders / summary.total) * 100) : 0;

  const draftShare =
    summary.total > 0 ? Math.round((summary.draft / summary.total) * 100) : 0;

  const pendingShare =
    summary.total > 0 ? Math.round((summary.pending / summary.total) * 100) : 0;

  const receivingShare =
    summary.total > 0
      ? Math.round(
          ((summary.approved + summary.partially_received) / summary.total) *
            100,
        )
      : 0;

  const receivedShare =
    summary.total > 0
      ? Math.round((summary.received / summary.total) * 100)
      : 0;

  const cancelledShare =
    summary.total > 0
      ? Math.round((summary.cancelled / summary.total) * 100)
      : 0;

  const hasActiveFilters = Boolean(
    search.trim() || status || supplierId || warehouseId || dateFrom || dateTo,
  );

  const pipelineStatusLabel =
    summary.total === 0
      ? "No purchase orders"
      : summary.pending > 0
        ? `${formatNumber(summary.pending)} awaiting approval`
        : summary.partially_received > 0
          ? `${formatNumber(summary.partially_received)} in receiving`
          : "Procurement workflow clear";

  const pipelineStatusClass =
    summary.total === 0
      ? "border-slate-500/20 bg-slate-500/10 text-slate-300"
      : summary.pending > 0
        ? "border-amber-500/20 bg-amber-500/10 text-amber-300"
        : summary.partially_received > 0
          ? "border-violet-500/20 bg-violet-500/10 text-violet-300"
          : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";

  const actionDialog = getOrderActionDialog(actionTarget);

  /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Purchase Orders" />

      <PageContainer className="gap-4 md:gap-5">
        {/* Supplier procurement overview */}

        <section className="min-w-0 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.08] via-card/70 to-card/40">
          <div className="flex flex-col gap-3 border-b border-border/60 bg-background/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                <ShoppingCart className="size-4" />
              </span>

              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-foreground">
                  Supplier Order Pipeline
                </p>

                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  Draft preparation, approval status, receiving progress,
                  supplier commitments, and order value.
                </p>
              </div>
            </div>

            <Badge
              variant="outline"
              className={cn(
                "h-6 w-fit shrink-0 rounded-full px-2.5 text-[9px] font-semibold",
                pipelineStatusClass,
              )}
            >
              {summary.total === 0 ? (
                <ClipboardCheck className="mr-1 size-3" />
              ) : summary.pending > 0 ? (
                <Clock3 className="mr-1 size-3" />
              ) : summary.partially_received > 0 ? (
                <PackageOpen className="mr-1 size-3" />
              ) : (
                <ShieldCheck className="mr-1 size-3" />
              )}

              {pipelineStatusLabel}
            </Badge>
          </div>

          <div className="grid min-w-0 lg:grid-cols-[minmax(330px,1.08fr)_minmax(0,1.92fr)]">
            <div className="relative overflow-hidden border-b border-border/60 p-4 lg:border-b-0 lg:border-r">
              <div className="pointer-events-none absolute -right-14 -top-16 size-44 rounded-full bg-primary/10 blur-3xl" />
              <ShoppingCart className="pointer-events-none absolute -bottom-8 -right-5 size-28 text-primary opacity-[0.025]" />

              <div className="relative grid gap-4 sm:grid-cols-[64px_minmax(0,1fr)] sm:items-center">
                <div className="flex size-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                  <ShoppingCart className="size-7" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-primary">
                        Open workflow coverage
                      </p>

                      <p className="mt-2 text-[27px] font-semibold leading-none tracking-[-0.04em]">
                        {formatNumber(openOrders)}

                        <span className="mx-1.5 text-base font-medium text-muted-foreground">
                          /
                        </span>

                        {formatNumber(summary.total)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-semibold tabular-nums text-primary">
                        {openShare}%
                      </p>

                      <p className="mt-1 text-[8px] uppercase tracking-wider text-muted-foreground">
                        In workflow
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-background/60">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${openShare}%` }}
                    />

                    <div
                      className="h-full bg-emerald-400 transition-all duration-500"
                      style={{ width: `${receivedShare}%` }}
                    />

                    <div
                      className="h-full bg-red-400 transition-all duration-500"
                      style={{ width: `${cancelledShare}%` }}
                    />
                  </div>

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[9px] text-muted-foreground">
                    <span>
                      {formatCurrency(summary.total_value)} committed value
                    </span>

                    <span>
                      {formatNumber(suppliers.length)} supplier
                      {suppliers.length === 1 ? "" : "s"} available
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid min-w-0 sm:grid-cols-2 xl:grid-cols-4">
              <PurchaseOrderNetworkMetric
                title="Purchase Orders"
                value={summary.total}
                description={`${formatNumber(summary.draft)} editable draft${summary.draft === 1 ? "" : "s"}`}
                footerLabel="Draft ratio"
                footerValue={`${draftShare}%`}
                progress={draftShare}
                icon={ClipboardCheck}
                tone="blue"
                className="border-b border-border/60 sm:border-r xl:border-b-0"
              />

              <PurchaseOrderNetworkMetric
                title="Awaiting Approval"
                value={summary.pending}
                description="Submitted orders awaiting approval"
                footerLabel="Pending review"
                footerValue={`${pendingShare}%`}
                progress={pendingShare}
                icon={Clock3}
                tone="amber"
                className="border-b border-border/60 xl:border-b-0 xl:border-r"
              />

              <PurchaseOrderNetworkMetric
                title="In Receiving"
                value={summary.partially_received}
                description={`${formatNumber(summary.approved)} approved and ready`}
                footerLabel="Receiving pipeline"
                footerValue={`${receivingShare}%`}
                progress={receivingShare}
                icon={PackageOpen}
                tone="violet"
                className="border-b border-border/60 sm:border-b-0 sm:border-r"
              />

              <PurchaseOrderNetworkMetric
                title="Received Orders"
                value={summary.received}
                description="Completed supplier deliveries"
                footerLabel="Completion rate"
                footerValue={`${receivedShare}%`}
                progress={receivedShare}
                icon={PackageCheck}
                tone="emerald"
              />
            </div>
          </div>
        </section>

        {/* Purchase order register */}

        <SectionCard
          title="Purchase Order Register"
          description="Create, edit, submit, and monitor purchase orders. Drafts remain editable before submission; approval decisions are handled outside this page."
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="h-7 rounded-full border-amber-500/15 bg-amber-500/[0.06] px-2.5 text-[10px] font-medium text-amber-300"
              >
                <ClipboardCheck className="mr-1 size-3" />
                {formatNumber(purchase_orders.total)} order
                {purchase_orders.total === 1 ? "" : "s"}
              </Badge>

              <Button
                type="button"
                onClick={openCreateDialog}
                className="h-9 rounded-lg px-3.5 text-xs"
              >
                <Plus className="size-3.5" />
                New Purchase Order
              </Button>
            </div>
          }
        >
          <FilterBar
            onSubmit={applyFilters}
            contentClassName="grid w-full min-w-0 gap-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-[minmax(240px,1fr)_155px_190px_190px_155px_155px]"
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
                  <RotateCcw className="size-3.5" />
                  Reset
                </Button>
              </>
            }
          >
            <SearchInput
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onClear={() => setSearch("")}
              placeholder="Search PO, supplier, branch, or warehouse..."
            />

            <Select
              value={status || ALL_VALUE}
              onValueChange={(value) =>
                setStatus(value === ALL_VALUE ? "" : value)
              }
            >
              <SelectTrigger className="h-10 w-full text-sm">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value={ALL_VALUE}>All statuses</SelectItem>

                {statuses.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={supplierId || ALL_VALUE}
              onValueChange={(value) =>
                setSupplierId(value === ALL_VALUE ? "" : value)
              }
            >
              <SelectTrigger className="h-10 w-full text-sm">
                <SelectValue placeholder="All suppliers" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value={ALL_VALUE}>All suppliers</SelectItem>

                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={String(supplier.id)}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={warehouseId || ALL_VALUE}
              onValueChange={(value) =>
                setWarehouseId(value === ALL_VALUE ? "" : value)
              }
            >
              <SelectTrigger className="h-10 w-full text-sm">
                <SelectValue placeholder="All warehouses" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value={ALL_VALUE}>All warehouses</SelectItem>

                {warehouses.map((warehouse) => (
                  <SelectItem key={warehouse.id} value={String(warehouse.id)}>
                    {warehouse.name} ({warehouse.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <IconInput
              id="filter_date_from"
              icon={CalendarDays}
              type="date"
              value={dateFrom}
              title="Order date from"
              aria-label="Order date from"
              onChange={(event) => setDateFrom(event.target.value)}
              className="h-10"
              iconClassName="text-primary"
            />

            <IconInput
              id="filter_date_to"
              icon={CalendarDays}
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              title="Order date to"
              aria-label="Order date to"
              onChange={(event) => setDateTo(event.target.value)}
              className="h-10"
              iconClassName="text-primary"
            />
          </FilterBar>

          <PurchaseOrderRegistryTable
            purchaseOrders={purchase_orders.data}
            viewer={viewer}
            expandedPurchaseOrderId={expandedPurchaseOrderId}
            onToggleDetails={togglePurchaseOrderDetails}
            onEdit={openEditDialog}
            onAction={requestOrderAction}
            onCreate={openCreateDialog}
          />

          <AppPagination
            pagination={purchase_orders}
            itemLabel="purchase orders"
          />
        </SectionCard>
      </PageContainer>

      {/*
            |--------------------------------------------------------------------------
            | Purchase order form
            |--------------------------------------------------------------------------
            */}

      <FormDialog
        open={isDialogOpen}
        onOpenChange={handleDialogOpenChange}
        title={
          editingPurchaseOrder
            ? `Edit ${editingPurchaseOrder.po_number}`
            : "New Purchase Order"
        }
        description="Select a supplier, receiving destination, products, quantities, and order costs."
        onSubmit={submitPurchaseOrder}
        processing={form.processing}
        submitText={editingPurchaseOrder ? "Save Changes" : "Create Draft"}
        processingText={
          editingPurchaseOrder ? "Saving Changes..." : "Creating Draft..."
        }
        maxWidth="max-w-6xl"
      >
        <FormSection
          title="Order Setup"
          description="Select the supplier and define the procurement schedule."
          icon={<ClipboardCheck />}
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <FormField
              id="supplier_id"
              label="Supplier"
              error={form.errors.supplier_id}
              required
            >
              <Select
                value={form.data.supplier_id || NONE_VALUE}
                onValueChange={(value) =>
                  changeSupplier(value === NONE_VALUE ? "" : value)
                }
              >
                <SelectTrigger id="supplier_id" className="w-full">
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value={NONE_VALUE}>Select supplier</SelectItem>

                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={String(supplier.id)}>
                      {supplier.name} ({supplier.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField
              id="order_date"
              label="Order Date"
              error={form.errors.order_date}
              required
            >
              <Input
                id="order_date"
                type="date"
                value={form.data.order_date}
                disabled={form.processing}
                onChange={(event) =>
                  form.setData("order_date", event.target.value)
                }
              />
            </FormField>

            <FormField
              id="expected_delivery_date"
              label="Expected Delivery"
              error={form.errors.expected_delivery_date}
            >
              <Input
                id="expected_delivery_date"
                type="date"
                min={form.data.order_date}
                value={form.data.expected_delivery_date}
                disabled={form.processing}
                onChange={(event) =>
                  form.setData("expected_delivery_date", event.target.value)
                }
              />
            </FormField>

            <FormField
              id="payment_terms"
              label="Payment Terms"
              error={form.errors.payment_terms}
            >
              <Input
                id="payment_terms"
                type="text"
                list="purchase-order-payment-terms"
                value={form.data.payment_terms}
                disabled={form.processing}
                onChange={(event) =>
                  form.setData("payment_terms", event.target.value)
                }
                placeholder="Net 30"
              />

              <datalist id="purchase-order-payment-terms">
                <option value="Cash on Delivery" />
                <option value="Cash Before Delivery" />
                <option value="Net 7" />
                <option value="Net 15" />
                <option value="Net 30" />
                <option value="Net 45" />
                <option value="Net 60" />
              </datalist>
            </FormField>
          </div>
        </FormSection>

        <FormSection
          title="Receiving Destination"
          description="Choose the business branch and warehouse that will receive the ordered products."
          icon={<Warehouse />}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              id="branch_id"
              label="Branch"
              error={form.errors.branch_id}
              required
            >
              <Select
                value={form.data.branch_id || NONE_VALUE}
                onValueChange={(value) =>
                  changeBranch(value === NONE_VALUE ? "" : value)
                }
              >
                <SelectTrigger id="branch_id" className="w-full">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value={NONE_VALUE}>Select branch</SelectItem>

                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={String(branch.id)}>
                      {branch.name} ({branch.code})
                      {branch.is_main ? " — Main" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField
              id="warehouse_id"
              label="Receiving Warehouse"
              error={form.errors.warehouse_id}
              required
            >
              <Select
                value={form.data.warehouse_id || NONE_VALUE}
                disabled={!form.data.branch_id}
                onValueChange={(value) =>
                  form.setData(
                    "warehouse_id",
                    value === NONE_VALUE ? "" : value,
                  )
                }
              >
                <SelectTrigger id="warehouse_id" className="w-full">
                  <SelectValue
                    placeholder={
                      form.data.branch_id
                        ? "Select warehouse"
                        : "Select a branch first"
                    }
                  />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value={NONE_VALUE}>
                    {form.data.branch_id
                      ? "Select warehouse"
                      : "Select a branch first"}
                  </SelectItem>

                  {modalWarehouses.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={String(warehouse.id)}>
                      {warehouse.name} ({warehouse.code})
                      {warehouse.is_main ? " — Main" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>
        </FormSection>

        <FormSection
          title="Order Items"
          description="Add the products, requested quantities, and agreed unit costs."
          icon={<Boxes />}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="h-6 gap-1.5 rounded-full border-violet-500/15 bg-violet-500/10 px-2.5 text-[10px] text-violet-300"
              >
                <Boxes className="size-3" />
                {form.data.items.length} line
                {form.data.items.length === 1 ? "" : "s"}
              </Badge>

              <Badge
                variant="outline"
                className="h-6 gap-1.5 rounded-full border-emerald-500/15 bg-emerald-500/10 px-2.5 text-[10px] text-emerald-300"
              >
                <Banknote className="size-3" />
                {formatCurrency(formSubtotal)}
              </Badge>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={addItem}
              disabled={form.processing}
              className="h-9 px-3 text-xs"
            >
              <Plus className="size-3.5" />
              Add Product
            </Button>
          </div>

          {form.errors.items && (
            <p className="rounded-lg border border-destructive/15 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {form.errors.items}
            </p>
          )}

          <div className="app-scrollbar-thin overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[980px] text-left">
              <thead className="border-b bg-muted/35">
                <tr className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="w-32 px-4 py-3 font-medium">Quantity</th>
                  <th className="w-40 px-4 py-3 font-medium">Unit Cost</th>
                  <th className="w-40 px-4 py-3 font-medium">Line Total</th>
                  <th className="px-4 py-3 font-medium">Notes</th>
                  <th className="w-16 px-4 py-3" />
                </tr>
              </thead>

              <tbody className="divide-y">
                {form.data.items.map((item, index) => {
                  const selectedProduct = products.find(
                    (product) => String(product.id) === item.product_id,
                  );

                  const lineTotal =
                    Number(item.quantity || 0) * Number(item.unit_cost || 0);

                  const selectedProductIds = form.data.items
                    .filter((_, itemIndex) => itemIndex !== index)
                    .map((otherItem) => otherItem.product_id);

                  return (
                    <tr
                      key={index}
                      className="align-top transition hover:bg-muted/[0.025]"
                    >
                      <td className="px-4 py-3">
                        <Select
                          value={item.product_id || NONE_VALUE}
                          onValueChange={(value) =>
                            changeItemProduct(
                              index,
                              value === NONE_VALUE ? "" : value,
                            )
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectItem value={NONE_VALUE}>
                              Select product
                            </SelectItem>

                            {products.map((product) => (
                              <SelectItem
                                key={product.id}
                                value={String(product.id)}
                                disabled={selectedProductIds.includes(
                                  String(product.id),
                                )}
                              >
                                {product.name}
                                {product.sku ? ` (${product.sku})` : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {selectedProduct && (
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            <Badge
                              variant="outline"
                              className="h-5 rounded-md border-violet-500/15 bg-violet-500/[0.06] px-1.5 font-mono text-[9px] text-violet-300"
                            >
                              {selectedProduct.sku ?? "NO SKU"}
                            </Badge>

                            <span className="text-[9px] text-muted-foreground">
                              Unit: {selectedProduct.unit}
                            </span>
                          </div>
                        )}

                        {itemError(index, "product_id") && (
                          <p className="mt-1 text-xs text-destructive">
                            {itemError(index, "product_id")}
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          min="0.0001"
                          step="0.0001"
                          value={item.quantity}
                          disabled={form.processing}
                          onChange={(event) =>
                            updateItem(index, "quantity", event.target.value)
                          }
                        />

                        {itemError(index, "quantity") && (
                          <p className="mt-1 text-xs text-destructive">
                            {itemError(index, "quantity")}
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <CurrencyInput
                          value={item.unit_cost}
                          disabled={form.processing}
                          onChange={(value) =>
                            updateItem(index, "unit_cost", value)
                          }
                        />

                        {itemError(index, "unit_cost") && (
                          <p className="mt-1 text-xs text-destructive">
                            {itemError(index, "unit_cost")}
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex h-10 items-center rounded-lg border border-primary/15 bg-primary/[0.06] px-3 text-sm font-semibold tabular-nums text-primary">
                          {formatCurrency(
                            Number.isFinite(lineTotal) ? lineTotal : 0,
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <Input
                          type="text"
                          value={item.notes}
                          disabled={form.processing}
                          onChange={(event) =>
                            updateItem(index, "notes", event.target.value)
                          }
                          placeholder="Optional line note"
                        />

                        {itemError(index, "notes") && (
                          <p className="mt-1 text-xs text-destructive">
                            {itemError(index, "notes")}
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <IconButton
                          label="Remove product"
                          onClick={() => removeItem(index)}
                          className="text-red-400 hover:bg-red-500/10 hover:text-red-400"
                        >
                          <Trash2 className="size-3.5" />
                        </IconButton>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </FormSection>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <FormSection
            title="Additional Information"
            description="Record delivery instructions, supplier notes, or internal procurement remarks."
            icon={<FilePenLine />}
          >
            <FormField id="notes" label="Order Notes" error={form.errors.notes}>
              <Textarea
                id="notes"
                rows={7}
                value={form.data.notes}
                disabled={form.processing}
                onChange={(event) => form.setData("notes", event.target.value)}
                placeholder="Delivery instructions, supplier notes, or internal remarks"
                className="resize-none"
              />
            </FormField>
          </FormSection>

          <section className="overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/[0.07] via-card to-card">
            <div className="flex items-center gap-3 border-b border-primary/15 px-4 py-3">
              <span className="inline-flex size-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                <Banknote className="size-4" />
              </span>

              <div>
                <h3 className="text-sm font-semibold">Order Summary</h3>

                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  Live procurement totals
                </p>
              </div>
            </div>

            <div className="space-y-4 p-4">
              <SummaryRow
                label="Subtotal"
                value={formatCurrency(formSubtotal)}
              />

              <FormField
                id="discount_amount"
                label="Discount"
                error={form.errors.discount_amount}
              >
                <CurrencyInput
                  id="discount_amount"
                  value={form.data.discount_amount}
                  disabled={form.processing}
                  onChange={(value) => form.setData("discount_amount", value)}
                />
              </FormField>

              <FormField
                id="tax_amount"
                label="Tax"
                error={form.errors.tax_amount}
              >
                <CurrencyInput
                  id="tax_amount"
                  value={form.data.tax_amount}
                  disabled={form.processing}
                  onChange={(value) => form.setData("tax_amount", value)}
                />
              </FormField>

              <FormField
                id="shipping_amount"
                label="Shipping"
                error={form.errors.shipping_amount}
              >
                <CurrencyInput
                  id="shipping_amount"
                  value={form.data.shipping_amount}
                  disabled={form.processing}
                  onChange={(value) => form.setData("shipping_amount", value)}
                />
              </FormField>

              <div className="border-t border-primary/15 pt-4">
                <SummaryRow
                  label="Order Total"
                  value={formatCurrency(Math.max(formTotal, 0))}
                  strong
                />
              </div>
            </div>
          </section>
        </div>
      </FormDialog>

      {/*
            |--------------------------------------------------------------------------
            | Workflow confirmation
            |--------------------------------------------------------------------------
            */}

      <ConfirmDialog
        open={actionTarget !== null}
        onOpenChange={(open) => {
          if (!open && !actionProcessing) {
            setActionTarget(null);
          }
        }}
        title={actionDialog.title}
        description={actionDialog.description}
        confirmText={actionDialog.confirmText}
        processing={actionProcessing}
        destructive={actionDialog.destructive}
        onConfirm={executeOrderAction}
      />
    </AppLayout>
  );
}

/*
|--------------------------------------------------------------------------
| Purchase order registry table
|--------------------------------------------------------------------------
*/

type PurchaseOrderRegistryTableProps = {
  purchaseOrders: PurchaseOrder[];
  viewer: PurchaseOrderViewer;
  expandedPurchaseOrderId: number | null;
  onToggleDetails: (purchaseOrderId: number) => void;
  onEdit: (purchaseOrder: PurchaseOrder) => void;
  onAction: (purchaseOrder: PurchaseOrder, action: OrderAction) => void;
  onCreate: () => void;
};

function PurchaseOrderRegistryTable({
  purchaseOrders,
  viewer,
  expandedPurchaseOrderId,
  onToggleDetails,
  onEdit,
  onAction,
  onCreate,
}: PurchaseOrderRegistryTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-background/20">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1040px] border-collapse">
          <thead className="select-none border-b border-border/70 bg-muted/20">
            <tr>
              <th scope="col" className="w-11 px-3 py-2.5 text-left">
                <span className="sr-only">Expand details</span>
              </th>

              <th
                scope="col"
                className="min-w-[220px] px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
              >
                Purchase Order
              </th>

              <th
                scope="col"
                className="min-w-[200px] px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
              >
                Supplier
              </th>

              <th
                scope="col"
                className="min-w-[210px] px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
              >
                Delivery
              </th>

              <th
                scope="col"
                className="min-w-[175px] px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
              >
                Order Summary
              </th>

              <th
                scope="col"
                className="min-w-[135px] px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
              >
                Status
              </th>

              <th
                scope="col"
                className="w-[144px] px-3 py-2.5 text-right text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
              >
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border/60">
            {purchaseOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12">
                  <div className="mx-auto flex max-w-sm flex-col items-center text-center">
                    <span className="flex size-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                      <ClipboardCheck className="size-5" />
                    </span>

                    <h3 className="mt-3 text-sm font-semibold">
                      No purchase orders found
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Create a draft purchase order to begin ordering inventory
                      from your suppliers.
                    </p>

                    <Button
                      type="button"
                      onClick={onCreate}
                      className="mt-4 h-9 px-3.5 text-xs"
                    >
                      <Plus className="size-3.5" />
                      New Purchase Order
                    </Button>
                  </div>
                </td>
              </tr>
            ) : (
              purchaseOrders.map((purchaseOrder) => {
                const isExpanded = expandedPurchaseOrderId === purchaseOrder.id;
                const detailsId = `purchase-order-details-${purchaseOrder.id}`;
                const isCreator =
                  purchaseOrder.created_by?.id === viewer.user_id;

                const canManageDraft =
                  purchaseOrder.status === "draft" &&
                  (viewer.is_owner || isCreator);

                const canAdvanceDraft =
                  purchaseOrder.status === "draft" && isCreator;

                return (
                  <Fragment key={purchaseOrder.id}>
                    <tr
                      tabIndex={0}
                      aria-expanded={isExpanded}
                      aria-controls={detailsId}
                      onClick={() => onToggleDetails(purchaseOrder.id)}
                      onKeyDown={(event) => {
                        if (event.target !== event.currentTarget) {
                          return;
                        }

                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onToggleDetails(purchaseOrder.id);
                        }
                      }}
                      className={cn(
                        "group cursor-pointer bg-card/10 transition-colors hover:bg-muted/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40",
                        isExpanded &&
                          "bg-primary/[0.04] hover:bg-primary/[0.065]",
                      )}
                    >
                      <td className="px-3 py-3 align-middle">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={
                            isExpanded
                              ? `Collapse ${purchaseOrder.po_number} details`
                              : `Expand ${purchaseOrder.po_number} details`
                          }
                          onClick={(event) => {
                            event.stopPropagation();
                            onToggleDetails(purchaseOrder.id);
                          }}
                          className={cn(
                            "size-7 rounded-md text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary",
                            isExpanded && "bg-primary/10 text-primary",
                          )}
                        >
                          <ChevronDown
                            className={cn(
                              "size-3.5 transition-transform duration-200",
                              isExpanded && "rotate-180",
                            )}
                          />
                        </Button>
                      </td>

                      <td className="px-3 py-3.5 align-middle">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <EntityAvatar
                            icon={ClipboardCheck}
                            className="border-primary/20 bg-primary/10 text-primary group-hover:border-primary/30 group-hover:bg-primary/15"
                          />

                          <p className="max-w-[190px] truncate text-[11px] font-semibold leading-4 text-foreground/90">
                            {purchaseOrder.po_number}
                          </p>
                        </div>
                      </td>

                      <td className="px-3 py-3.5 align-middle">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <EntityAvatar
                            icon={Truck}
                            className="border-primary/20 bg-primary/10 text-primary"
                          />

                          <p className="max-w-[165px] truncate text-[10px] font-medium leading-4 text-foreground/85">
                            {purchaseOrder.supplier.name}
                          </p>
                        </div>
                      </td>

                      <td className="px-3 py-3.5 align-middle">
                        <div className="space-y-1.5">
                          <div className="flex min-w-0 items-center gap-2">
                            <Building2 className="size-3.5 shrink-0 text-primary" />

                            <span className="max-w-[165px] truncate text-[10px] font-semibold text-foreground/90">
                              {purchaseOrder.branch.name}
                            </span>
                          </div>

                          <div className="flex min-w-0 items-center gap-2">
                            <CalendarDays className="size-3.5 shrink-0 text-primary" />

                            <span className="text-[9px] text-muted-foreground">
                              {formatDate(purchaseOrder.expected_delivery_date)}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-3.5 align-middle">
                        <div className="space-y-1">
                          <p className="text-[12px] font-semibold tabular-nums text-primary">
                            {formatCurrency(purchaseOrder.total_amount)}
                          </p>

                          <p className="text-[9px] text-muted-foreground">
                            {purchaseOrder.items_count} product
                            {purchaseOrder.items_count === 1 ? "" : "s"}
                          </p>
                        </div>
                      </td>

                      <td className="px-3 py-3.5 align-middle">
                        <PurchaseOrderStatus
                          status={purchaseOrder.status}
                          label={purchaseOrder.status_label}
                        />
                      </td>

                      <td className="px-3 py-3.5 text-right align-middle">
                        <div
                          className="inline-flex"
                          onClick={(event) => event.stopPropagation()}
                          onKeyDown={(event) => event.stopPropagation()}
                        >
                          <ActionGroup>
                            {canManageDraft && purchaseOrder.items && (
                              <IconButton
                                label="Edit purchase order"
                                onClick={() => onEdit(purchaseOrder)}
                                className="text-primary hover:bg-primary/10 hover:text-primary"
                              >
                                <Pencil className="size-3.5" />
                              </IconButton>
                            )}

                            {canAdvanceDraft && (
                              <IconButton
                                label="Submit for approval"
                                onClick={() =>
                                  onAction(purchaseOrder, "submit")
                                }
                                className="text-primary hover:bg-primary/10 hover:text-primary"
                              >
                                <Send className="size-3.5" />
                              </IconButton>
                            )}
                          </ActionGroup>
                        </div>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr id={detailsId} className="bg-muted/[0.08]">
                        <td colSpan={7} className="px-3 pb-3 pt-0">
                          <PurchaseOrderExpandedDetails
                            purchaseOrder={purchaseOrder}
                          />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PurchaseOrderExpandedDetails({
  purchaseOrder,
}: {
  purchaseOrder: PurchaseOrder;
}) {
  const progress = getFulfillmentProgress(purchaseOrder);
  const items = purchaseOrder.items ?? [];

  return (
    <div className="overflow-hidden rounded-xl border border-primary/15 bg-background/45 shadow-sm">
      <div className="flex flex-col gap-2 border-b border-border/60 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
            Complete Purchase Order Record
          </p>

          <p className="mt-0.5 text-[9px] text-muted-foreground">
            Delivery, financial, fulfillment, product, and workflow information.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="h-6 rounded-full border-border/70 bg-muted/20 px-2.5 font-mono text-[9px] text-muted-foreground"
          >
            {purchaseOrder.po_number}
          </Badge>

          <PurchaseOrderStatus
            status={purchaseOrder.status}
            label={purchaseOrder.status_label}
          />
        </div>
      </div>

      <div className="grid gap-3 p-3 lg:grid-cols-2 xl:grid-cols-4">
        <PurchaseOrderDetailSection
          title="Supplier & Schedule"
          description="Supplier commitment and requested delivery dates."
          icon={Truck}
          iconClassName="border-primary/20 bg-primary/10 text-primary"
        >
          <PurchaseOrderDetailItem
            label="Supplier"
            value={`${purchaseOrder.supplier.name}${
              purchaseOrder.supplier.code
                ? ` · ${purchaseOrder.supplier.code}`
                : ""
            }`}
            icon={Truck}
          />

          <PurchaseOrderDetailItem
            label="Contact person"
            value={purchaseOrder.supplier.contact_person ?? "Not provided"}
            icon={UserRound}
          />

          <PurchaseOrderDetailItem
            label="Order date"
            value={formatDate(purchaseOrder.order_date)}
            icon={CalendarDays}
          />

          <PurchaseOrderDetailItem
            label="Expected delivery"
            value={formatDate(purchaseOrder.expected_delivery_date)}
            icon={CalendarDays}
          />

          <PurchaseOrderDetailItem
            label="Payment terms"
            value={purchaseOrder.payment_terms ?? "Not configured"}
            icon={Banknote}
          />
        </PurchaseOrderDetailSection>

        <PurchaseOrderDetailSection
          title="Receiving Destination"
          description="Branch and warehouse assigned to receive this order."
          icon={Warehouse}
          iconClassName="border-primary/20 bg-primary/10 text-primary"
        >
          <PurchaseOrderDetailItem
            label="Branch"
            value={`${purchaseOrder.branch.name}${
              purchaseOrder.branch.code ? ` · ${purchaseOrder.branch.code}` : ""
            }`}
            icon={Building2}
          />

          <PurchaseOrderDetailItem
            label="Warehouse"
            value={`${purchaseOrder.warehouse.name}${
              purchaseOrder.warehouse.code
                ? ` · ${purchaseOrder.warehouse.code}`
                : ""
            }`}
            icon={Warehouse}
          />

          <PurchaseOrderDetailItem
            label="Ordered quantity"
            value={`${formatQuantity(purchaseOrder.ordered_quantity)} units`}
            icon={Boxes}
          />

          <PurchaseOrderDetailItem
            label="Received quantity"
            value={`${formatQuantity(purchaseOrder.received_quantity)} units`}
            icon={PackageCheck}
          />

          <div className="rounded-lg border border-primary/15 bg-primary/[0.05] p-2.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[8px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                Fulfillment progress
              </span>

              <span className="text-[11px] font-semibold tabular-nums text-primary">
                {progress}%
              </span>
            </div>

            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  progress >= 100
                    ? "bg-emerald-400"
                    : progress > 0
                      ? "bg-violet-400"
                      : "bg-slate-500",
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </PurchaseOrderDetailSection>

        <PurchaseOrderDetailSection
          title="Financial Breakdown"
          description="Complete calculation of the committed order value."
          icon={CircleDollarSign}
          iconClassName="border-primary/20 bg-primary/10 text-primary"
        >
          <PurchaseOrderDetailItem
            label="Subtotal"
            value={formatCurrency(purchaseOrder.subtotal)}
            icon={Banknote}
            valueClassName="font-semibold tabular-nums"
          />

          <PurchaseOrderDetailItem
            label="Discount"
            value={formatCurrency(purchaseOrder.discount_amount)}
            icon={CircleDollarSign}
          />

          <PurchaseOrderDetailItem
            label="Tax"
            value={formatCurrency(purchaseOrder.tax_amount)}
            icon={CircleDollarSign}
          />

          <PurchaseOrderDetailItem
            label="Shipping"
            value={formatCurrency(purchaseOrder.shipping_amount)}
            icon={Truck}
          />

          <PurchaseOrderDetailItem
            label="Order total"
            value={formatCurrency(purchaseOrder.total_amount)}
            icon={Banknote}
            valueClassName="font-semibold tabular-nums text-primary"
          />
        </PurchaseOrderDetailSection>

        <PurchaseOrderDetailSection
          title="Workflow & Audit"
          description="Ownership, approvals, cancellation, and record dates."
          icon={ShieldCheck}
          iconClassName="border-primary/20 bg-primary/10 text-primary"
        >
          <PurchaseOrderDetailItem
            label="Created by"
            value={formatUserReference(purchaseOrder.created_by)}
            icon={UserRound}
          />

          <PurchaseOrderDetailItem
            label="Created"
            value={formatDateTime(purchaseOrder.created_at)}
            icon={CalendarDays}
          />

          {purchaseOrder.submitted_at && (
            <PurchaseOrderDetailItem
              label="Submitted"
              value={`${formatUserReference(
                purchaseOrder.submitted_by,
              )} · ${formatDateTime(purchaseOrder.submitted_at)}`}
              icon={Send}
              multiline
            />
          )}

          {purchaseOrder.approved_at && (
            <PurchaseOrderDetailItem
              label="Approved"
              value={`${formatUserReference(
                purchaseOrder.approved_by,
              )} · ${formatDateTime(purchaseOrder.approved_at)}`}
              icon={CheckCircle2}
              multiline
            />
          )}

          {purchaseOrder.cancelled_at && (
            <PurchaseOrderDetailItem
              label="Cancelled"
              value={`${formatUserReference(
                purchaseOrder.cancelled_by,
              )} · ${formatDateTime(purchaseOrder.cancelled_at)}`}
              icon={Ban}
              multiline
            />
          )}

          <PurchaseOrderDetailItem
            label="Last updated"
            value={formatDateTime(purchaseOrder.updated_at)}
            icon={CalendarDays}
          />

          <PurchaseOrderDetailItem
            label="Order notes"
            value={purchaseOrder.notes ?? "No order notes"}
            icon={FilePenLine}
            multiline
          />
        </PurchaseOrderDetailSection>
      </div>

      <section className="border-t border-border/60 p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-[11px] font-semibold">Products & Receiving</h3>

            <p className="mt-0.5 text-[8px] leading-4 text-muted-foreground">
              Ordered products, costs, received quantities, and line notes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="h-6 gap-1.5 rounded-full border-cyan-500/15 bg-cyan-500/10 px-2.5 text-[9px] text-cyan-300"
            >
              <Boxes className="size-3" />
              {purchaseOrder.items_count} product
              {purchaseOrder.items_count === 1 ? "" : "s"}
            </Badge>

            <Badge
              variant="outline"
              className="h-6 gap-1.5 rounded-full border-violet-500/15 bg-violet-500/10 px-2.5 text-[9px] text-violet-300"
            >
              <PackageOpen className="size-3" />
              {formatQuantity(purchaseOrder.received_quantity)} /{" "}
              {formatQuantity(purchaseOrder.ordered_quantity)} received
            </Badge>
          </div>
        </div>

        {items.length > 0 ? (
          <div className="app-scrollbar-thin mt-3 overflow-x-auto rounded-lg border border-border/60">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead className="border-b border-border/60 bg-muted/20">
                <tr className="text-[8px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  <th className="min-w-[230px] px-3 py-2.5">Product</th>
                  <th className="w-28 px-3 py-2.5">Ordered</th>
                  <th className="w-28 px-3 py-2.5">Received</th>
                  <th className="w-36 px-3 py-2.5">Unit Cost</th>
                  <th className="w-36 px-3 py-2.5">Line Total</th>
                  <th className="min-w-[190px] px-3 py-2.5">Notes</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border/50">
                {items.map((item) => (
                  <tr key={item.id} className="bg-card/10 align-top">
                    <td className="px-3 py-2.5">
                      <p className="text-[10px] font-semibold">
                        {item.product_name}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className="h-5 rounded-md border-violet-500/15 bg-violet-500/[0.06] px-1.5 font-mono text-[8px] text-violet-300"
                        >
                          {item.product_sku ?? "NO SKU"}
                        </Badge>

                        <span className="text-[8px] text-muted-foreground">
                          Unit: {item.unit}
                        </span>
                      </div>
                    </td>

                    <td className="px-3 py-2.5 text-[10px] font-medium tabular-nums">
                      {formatQuantity(item.quantity)}
                    </td>

                    <td className="px-3 py-2.5 text-[10px] font-medium tabular-nums text-cyan-400">
                      {formatQuantity(item.received_quantity)}
                    </td>

                    <td className="px-3 py-2.5 text-[10px] tabular-nums">
                      {formatCurrency(item.unit_cost)}
                    </td>

                    <td className="px-3 py-2.5 text-[10px] font-semibold tabular-nums text-primary">
                      {formatCurrency(item.line_total)}
                    </td>

                    <td className="px-3 py-2.5 text-[9px] leading-4 text-muted-foreground">
                      {item.notes ?? "No line notes"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-3 rounded-lg border border-dashed border-border/70 bg-muted/[0.06] px-4 py-6 text-center">
            <Boxes className="mx-auto size-5 text-muted-foreground" />

            <p className="mt-2 text-[10px] font-semibold">
              Item details are not included
            </p>

            <p className="mt-1 text-[9px] text-muted-foreground">
              The order summary is available, but product line details were not
              returned by the current controller response.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function PurchaseOrderDetailSection({
  title,
  description,
  icon: Icon,
  iconClassName,
  children,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  iconClassName: string;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-lg border border-border/60 bg-card/25 p-3">
      <div className="flex items-start gap-2.5">
        <span
          className={cn(
            "inline-flex size-7 shrink-0 items-center justify-center rounded-lg border",
            iconClassName,
          )}
        >
          <Icon className="size-3.5" />
        </span>

        <div className="min-w-0">
          <h3 className="text-[11px] font-semibold">{title}</h3>

          <p className="mt-0.5 text-[8px] leading-4 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-2.5">{children}</div>
    </section>
  );
}

function PurchaseOrderDetailItem({
  label,
  value,
  icon: Icon,
  multiline = false,
  valueClassName,
}: {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  multiline?: boolean;
  valueClassName?: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-2">
      <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-muted/40 text-muted-foreground">
        <Icon className="size-3" />
      </span>

      <div className="min-w-0">
        <p className="text-[8px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
          {label}
        </p>

        <div
          className={cn(
            "mt-0.5 text-[10px] leading-4 text-foreground/80",
            multiline ? "whitespace-pre-wrap break-words" : "truncate",
            valueClassName,
          )}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function getFulfillmentProgress(purchaseOrder: PurchaseOrder): number {
  if (purchaseOrder.ordered_quantity <= 0) {
    return 0;
  }

  return Math.min(
    100,
    Math.round(
      (purchaseOrder.received_quantity / purchaseOrder.ordered_quantity) * 100,
    ),
  );
}

function formatUserReference(user: UserReference | null): string {
  if (!user) {
    return "Not recorded";
  }

  return user.email ? `${user.name} · ${user.email}` : user.name;
}

/*
|--------------------------------------------------------------------------
| Purchase order network metric
|--------------------------------------------------------------------------
*/

function PurchaseOrderNetworkMetric({
  title,
  value,
  description,
  footerLabel,
  footerValue,
  progress,
  icon: Icon,
  tone,
  className,
}: {
  title: string;
  value: number | string;
  description: string;
  footerLabel: string;
  footerValue: string;
  progress: number;
  icon: LucideIcon;
  tone: "blue" | "amber" | "violet" | "emerald";
  className?: string;
}) {
  const toneStyles = {
    blue: {
      icon: "border-primary/20 bg-primary/10 text-primary",
      value: "text-primary",
      glow: "bg-primary/10",
      bar: "bg-primary",
      footer: "text-primary",
    },
    amber: {
      icon: "border-amber-500/20 bg-amber-500/10 text-amber-400",
      value: "text-amber-400",
      glow: "bg-amber-500/10",
      bar: "bg-amber-400",
      footer: "text-amber-300",
    },
    violet: {
      icon: "border-violet-500/20 bg-violet-500/10 text-violet-400",
      value: "text-violet-400",
      glow: "bg-violet-500/10",
      bar: "bg-violet-400",
      footer: "text-violet-300",
    },
    emerald: {
      icon: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
      value: "text-emerald-400",
      glow: "bg-emerald-500/10",
      bar: "bg-emerald-400",
      footer: "text-emerald-300",
    },
  } as const;

  const styles = toneStyles[tone];
  const normalizedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div
      className={cn(
        "group relative flex min-h-[118px] min-w-0 flex-col overflow-hidden px-4 py-3.5 transition-colors hover:bg-muted/[0.025]",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-10 -top-10 size-24 rounded-full blur-2xl",
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
              "mt-2 text-xl font-semibold leading-none tabular-nums",
              styles.value,
            )}
          >
            {value}
          </p>

          <p className="mt-1.5 truncate text-[9px] text-muted-foreground">
            {description}
          </p>
        </div>

        <span
          className={cn(
            "inline-flex size-8 shrink-0 items-center justify-center rounded-lg border",
            styles.icon,
          )}
        >
          <Icon className="size-4" />
        </span>
      </div>

      <div className="relative mt-auto border-t border-border/45 pt-2.5">
        <div className="flex items-center justify-between gap-3 text-[8px]">
          <span className="truncate font-medium uppercase tracking-[0.09em] text-muted-foreground">
            {footerLabel}
          </span>

          <span
            className={cn("shrink-0 font-semibold tabular-nums", styles.footer)}
          >
            {footerValue}
          </span>
        </div>

        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-background/70 ring-1 ring-border/20">
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-500",
              styles.bar,
            )}
            style={{ width: `${normalizedProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Purchase order status
|--------------------------------------------------------------------------
*/

function PurchaseOrderStatus({
  status,
  label,
}: {
  status: string;
  label: string;
}) {
  const variants: Record<
    string,
    "neutral" | "warning" | "info" | "pending" | "success" | "danger"
  > = {
    draft: "neutral",
    pending: "warning",
    approved: "info",
    partially_received: "pending",
    received: "success",
    cancelled: "danger",
  };

  return <StatusBadge label={label} variant={variants[status] ?? "neutral"} />;
}

/*
|--------------------------------------------------------------------------
| Currency input
|--------------------------------------------------------------------------
*/

function CurrencyInput({
  id,
  value,
  disabled = false,
  onChange,
}: {
  id?: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-primary">
        ₱
      </span>

      <Input
        id={id}
        type="number"
        min="0"
        step="0.01"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder="0.00"
        className="pl-8 tabular-nums"
      />
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Summary row
|--------------------------------------------------------------------------
*/

function SummaryRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={
          strong ? "text-sm font-semibold" : "text-xs text-muted-foreground"
        }
      >
        {label}
      </span>

      <span
        className={
          strong
            ? "text-lg font-semibold tabular-nums text-primary"
            : "text-sm font-medium tabular-nums"
        }
      >
        {value}
      </span>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Workflow confirmation content
|--------------------------------------------------------------------------
*/

function getOrderActionDialog(target: OrderActionTarget | null): {
  title: string;
  description: string;
  confirmText: string;
  destructive: boolean;
} {
  if (!target) {
    return {
      title: "Update Purchase Order",
      description: "Confirm the selected purchase order action.",
      confirmText: "Continue",
      destructive: false,
    };
  }

  const number = target.order.po_number;

  switch (target.action) {
    case "submit":
      return {
        title: "Submit Purchase Order",
        description: `Submit ${number} for approval? The draft will move to the pending approval queue.`,
        confirmText: "Submit for Approval",
        destructive: false,
      };
    default:
      return {
        title: "Update Purchase Order",
        description: `Continue updating ${number}?`,
        confirmText: "Continue",
        destructive: false,
      };
  }
}

/*
|--------------------------------------------------------------------------
| Formatters
|--------------------------------------------------------------------------
*/

function formatNumber(value: number | string | null): string {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("en-PH").format(
    Number.isFinite(amount) ? amount : 0,
  );
}

function formatCurrency(value: number | string | null): string {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function formatQuantity(value: number | string | null): string {
  const quantity = Number(value ?? 0);

  return new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  }).format(Number.isFinite(quantity) ? quantity : 0);
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return "Not recorded";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatDate(value: string | null): string {
  if (!value) {
    return "Not set";
  }

  const date = new Date(value.includes("T") ? value : `${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}