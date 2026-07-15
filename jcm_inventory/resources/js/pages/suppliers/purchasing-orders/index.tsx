import { ActionGroup } from "@/components/shared/action-group";
import { AppPagination } from "@/components/shared/app-pagination";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { EntityAvatar } from "@/components/shared/entity-avatar";
import { EntityInfo } from "@/components/shared/entity-info";
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
  ArrowRight,
  Banknote,
  Ban,
  Boxes,
  Building2,
  CalendarDays,
  CheckCircle2,
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
  Sparkles,
  ShoppingCart,
  Trash2,
  Truck,
  UserRound,
  Warehouse,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";

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

type PurchaseOrderPageProps = {
  purchase_orders: PaginatedPurchaseOrders;
  summary: PurchaseOrderSummary;
  suppliers: SupplierOption[];
  branches: BranchOption[];
  warehouses: WarehouseOption[];
  products: ProductOption[];
  statuses: StatusOption[];
  filters: PurchaseOrderFilters;
};

type OrderAction = "submit" | "approve" | "cancel" | "delete";

type OrderActionTarget = {
  order: PurchaseOrder;
  action: OrderAction;
};

type PipelineTone = "slate" | "amber" | "blue" | "violet" | "emerald" | "red";

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
}: PurchaseOrderPageProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

    if (action === "delete") {
      router.delete(`/suppliers/purchase-orders/${order.id}`, options);

      return;
    }

    router.post(
      `/suppliers/purchase-orders/${order.id}/${action}`,
      {},
      options,
    );
  }

  /*
    |--------------------------------------------------------------------------
    | Derived dashboard values
    |--------------------------------------------------------------------------
    */

  const openOrders =
    summary.draft +
    summary.pending +
    summary.approved +
    summary.partially_received;

  const completedOrders = summary.received;

  const activeShare =
    summary.total > 0 ? Math.round((openOrders / summary.total) * 100) : 0;

  const completionRate =
    summary.total > 0
      ? Math.round((summary.received / summary.total) * 100)
      : 0;

  const approvalRate =
    summary.total > 0
      ? Math.round(
          ((summary.approved + summary.partially_received + summary.received) /
            summary.total) *
            100,
        )
      : 0;

  const pipelineStages = [
    {
      key: "draft",
      label: "Draft",
      description: "Prepared but not submitted",
      value: summary.draft,
      icon: FilePenLine,
      tone: "slate" as PipelineTone,
    },
    {
      key: "pending",
      label: "Pending",
      description: "Waiting for approval",
      value: summary.pending,
      icon: Clock3,
      tone: "amber" as PipelineTone,
    },
    {
      key: "approved",
      label: "Approved",
      description: "Ready for supplier delivery",
      value: summary.approved,
      icon: CheckCircle2,
      tone: "blue" as PipelineTone,
    },
    {
      key: "partial",
      label: "Receiving",
      description: "Partially delivered to stock",
      value: summary.partially_received,
      icon: PackageOpen,
      tone: "violet" as PipelineTone,
    },
    {
      key: "received",
      label: "Received",
      description: "Fully received and completed",
      value: summary.received,
      icon: PackageCheck,
      tone: "emerald" as PipelineTone,
    },
    {
      key: "cancelled",
      label: "Cancelled",
      description: "Closed without receiving",
      value: summary.cancelled,
      icon: XCircle,
      tone: "red" as PipelineTone,
    },
  ];

  /*
    |--------------------------------------------------------------------------
    | Table columns
    |--------------------------------------------------------------------------
    */

  const columns: DataTableColumn<PurchaseOrder>[] = [
    {
      key: "purchase_order",
      header: "Purchase Order",
      className: "min-w-[230px]",
      cell: (purchaseOrder) => (
        <EntityInfo
          avatar={
            <EntityAvatar
              icon={ClipboardCheck}
              className="border-blue-500/15 bg-blue-500/10 text-blue-400 group-hover:border-blue-500/25 group-hover:bg-blue-500/15"
            />
          }
          title={purchaseOrder.po_number}
          badges={
            purchaseOrder.status === "draft" ? (
              <Badge
                variant="outline"
                className="h-5 rounded-full border-slate-500/20 bg-slate-500/10 px-2 text-[9px] font-semibold text-slate-300"
              >
                EDITABLE
              </Badge>
            ) : undefined
          }
          subtitle={
            <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>Created {formatDate(purchaseOrder.created_at)}</span>

              <span className="text-border">•</span>

              <span className="inline-flex items-center gap-1">
                <UserRound className="size-3 text-fuchsia-400" />
                {purchaseOrder.created_by?.name ?? "System"}
              </span>
            </span>
          }
        />
      ),
    },
    {
      key: "supplier",
      header: "Supplier",
      className: "min-w-[210px]",
      cell: (purchaseOrder) => (
        <div className="flex items-start gap-2.5">
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-emerald-500/15 bg-emerald-500/10 text-emerald-400">
            <Truck className="size-4" />
          </span>

          <div className="min-w-0">
            <p className="max-w-[180px] truncate text-[12px] font-semibold text-foreground/90">
              {purchaseOrder.supplier.name}
            </p>

            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <Badge
                variant="outline"
                className="h-5 rounded-md border-emerald-500/15 bg-emerald-500/[0.06] px-1.5 font-mono text-[9px] text-emerald-300"
              >
                {purchaseOrder.supplier.code ?? "NO CODE"}
              </Badge>

              {purchaseOrder.supplier.contact_person && (
                <span className="max-w-[110px] truncate text-[9px] text-muted-foreground">
                  {purchaseOrder.supplier.contact_person}
                </span>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "destination",
      header: "Delivery Route",
      className: "min-w-[235px]",
      cell: (purchaseOrder) => (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-violet-500/10 text-violet-400">
              <Warehouse className="size-3" />
            </span>

            <div className="min-w-0">
              <p className="max-w-[170px] truncate text-[11px] font-semibold">
                {purchaseOrder.warehouse.name}
              </p>

              <p className="text-[9px] text-muted-foreground">
                {purchaseOrder.warehouse.code ?? "No warehouse code"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pl-1">
            <ArrowRight className="size-3 text-muted-foreground" />

            <Badge
              variant="outline"
              className="h-5 gap-1 rounded-full border-blue-500/15 bg-blue-500/[0.06] px-2 text-[9px] text-blue-300"
            >
              <Building2 className="size-2.5" />
              {purchaseOrder.branch.name}
            </Badge>
          </div>
        </div>
      ),
    },
    {
      key: "schedule",
      header: "Schedule",
      className: "min-w-[185px]",
      cell: (purchaseOrder) => (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex size-6 items-center justify-center rounded-md bg-blue-500/10 text-blue-400">
              <CalendarDays className="size-3" />
            </span>

            <div>
              <p className="text-[9px] text-muted-foreground">Order date</p>

              <p className="text-[11px] font-semibold">
                {formatDate(purchaseOrder.order_date)}
              </p>
            </div>
          </div>

          <div className="pl-8">
            <p className="text-[9px] text-muted-foreground">
              Expected:{" "}
              <span className="font-medium text-foreground/75">
                {formatDate(purchaseOrder.expected_delivery_date)}
              </span>
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "fulfillment",
      header: "Fulfillment",
      className: "min-w-[210px]",
      cell: (purchaseOrder) => {
        const progress =
          purchaseOrder.ordered_quantity > 0
            ? Math.min(
                100,
                Math.round(
                  (purchaseOrder.received_quantity /
                    purchaseOrder.ordered_quantity) *
                    100,
                ),
              )
            : 0;

        return (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <Badge
                variant="outline"
                className="h-6 gap-1.5 rounded-full border-cyan-500/15 bg-cyan-500/10 px-2.5 text-[9px] text-cyan-300"
              >
                <Boxes className="size-3" />
                {purchaseOrder.items_count} products
              </Badge>

              <span className="text-[10px] font-semibold tabular-nums text-cyan-400">
                {progress}%
              </span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  progress >= 100
                    ? "bg-emerald-400"
                    : progress > 0
                      ? "bg-violet-400"
                      : "bg-slate-500",
                )}
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            <p className="text-[9px] text-muted-foreground">
              {formatQuantity(purchaseOrder.received_quantity)} of{" "}
              {formatQuantity(purchaseOrder.ordered_quantity)} units received
            </p>
          </div>
        );
      },
    },
    {
      key: "financials",
      header: "Order Value",
      className: "min-w-[180px]",
      cell: (purchaseOrder) => (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <CircleDollarSign className="size-3.5" />
            </span>

            <p className="text-[13px] font-semibold tabular-nums text-emerald-400">
              {formatCurrency(purchaseOrder.total_amount)}
            </p>
          </div>

          <div className="space-y-1 pl-9 text-[9px] text-muted-foreground">
            {purchaseOrder.discount_amount > 0 && (
              <p>Discount: {formatCurrency(purchaseOrder.discount_amount)}</p>
            )}

            <p>
              Terms:{" "}
              <span className="font-medium text-foreground/75">
                {purchaseOrder.payment_terms ?? "Not set"}
              </span>
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      className: "min-w-[140px]",
      cell: (purchaseOrder) => (
        <PurchaseOrderStatus
          status={purchaseOrder.status}
          label={purchaseOrder.status_label}
        />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      cell: (purchaseOrder) => (
        <ActionGroup>
          {purchaseOrder.status === "draft" && purchaseOrder.items && (
            <IconButton
              label="Edit purchase order"
              onClick={() => openEditDialog(purchaseOrder)}
              className="text-blue-400 hover:bg-blue-500/10 hover:text-blue-400"
            >
              <Pencil className="size-3.5" />
            </IconButton>
          )}

          {purchaseOrder.status === "draft" && (
            <IconButton
              label="Submit for approval"
              onClick={() => requestOrderAction(purchaseOrder, "submit")}
              className="text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-400"
            >
              <Send className="size-3.5" />
            </IconButton>
          )}

          {purchaseOrder.status === "pending" && (
            <IconButton
              label="Approve purchase order"
              onClick={() => requestOrderAction(purchaseOrder, "approve")}
              className="text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-400"
            >
              <CheckCircle2 className="size-3.5" />
            </IconButton>
          )}

          {["draft", "pending", "approved"].includes(purchaseOrder.status) && (
            <IconButton
              label="Cancel purchase order"
              onClick={() => requestOrderAction(purchaseOrder, "cancel")}
              className="text-amber-400 hover:bg-amber-500/10 hover:text-amber-400"
            >
              <Ban className="size-3.5" />
            </IconButton>
          )}

          {purchaseOrder.status === "draft" && (
            <IconButton
              label="Delete draft"
              onClick={() => requestOrderAction(purchaseOrder, "delete")}
              className="text-red-400 hover:bg-red-500/10 hover:text-red-400"
            >
              <Trash2 className="size-3.5" />
            </IconButton>
          )}
        </ActionGroup>
      ),
    },
  ];

  const actionDialog = getOrderActionDialog(actionTarget);

  /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Purchase Orders" />

      <PageContainer className="gap-3.5 md:gap-4">
        {/*
                |--------------------------------------------------------------------------
                | Procurement command board
                |--------------------------------------------------------------------------
                */}

        <section className="relative min-w-0 overflow-hidden rounded-2xl border border-cyan-500/15 bg-card/75 shadow-sm">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_15%,rgba(34,211,238,0.08),transparent_30%),radial-gradient(circle_at_88%_20%,rgba(16,185,129,0.07),transparent_28%),linear-gradient(to_bottom_right,rgba(255,255,255,0.018),transparent_55%)]" />

          <div className="relative flex flex-col gap-3 border-b border-border/60 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400 shadow-[0_0_24px_rgba(34,211,238,0.08)]">
                <ShoppingCart className="size-4.5" />
                <span className="absolute -right-1 -top-1 size-2 rounded-full border-2 border-card bg-emerald-400" />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-sm font-semibold tracking-tight">
                    Procurement Command Board
                  </h1>

                  <Badge
                    variant="outline"
                    className="h-5 gap-1 rounded-full border-cyan-500/15 bg-cyan-500/[0.07] px-2 text-[9px] font-semibold text-cyan-300"
                  >
                    <Sparkles className="size-2.5" />
                    LIVE PIPELINE
                  </Badge>
                </div>

                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  Approval flow, delivery readiness, and committed purchase
                  value in one compact view.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="h-7 gap-1.5 rounded-full border-blue-500/15 bg-blue-500/10 px-3 text-[10px] text-blue-300"
              >
                <ClipboardCheck className="size-3" />
                {formatNumber(summary.total)} orders
              </Badge>

              <Badge
                variant="outline"
                className="h-7 gap-1.5 rounded-full border-amber-500/15 bg-amber-500/10 px-3 text-[10px] text-amber-300"
              >
                <Clock3 className="size-3" />
                {formatNumber(summary.pending)} awaiting approval
              </Badge>

              <Badge
                variant="outline"
                className="h-7 gap-1.5 rounded-full border-emerald-500/15 bg-emerald-500/10 px-3 text-[10px] text-emerald-300"
              >
                <PackageCheck className="size-3" />
                {formatNumber(completedOrders)} received
              </Badge>
            </div>
          </div>

          <div className="relative grid min-w-0 xl:grid-cols-[240px_minmax(0,1fr)_270px]">
            <div className="flex min-h-[178px] items-center gap-4 border-b border-border/60 p-4 xl:border-b-0 xl:border-r">
              <CompletionDonut
                value={completionRate}
                completed={summary.received}
                total={summary.total}
              />

              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
                  Fulfillment health
                </p>

                <p className="mt-2 text-sm font-semibold">
                  {completionRate >= 75
                    ? "Strong completion"
                    : completionRate >= 40
                      ? "Orders progressing"
                      : "Pipeline building"}
                </p>

                <p className="mt-1 text-[9px] leading-4 text-muted-foreground">
                  {formatNumber(summary.received)} fully received from{" "}
                  {formatNumber(summary.total)} purchase orders.
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <span className="inline-flex size-6 items-center justify-center rounded-md bg-blue-500/10 text-blue-400">
                    <ShieldCheck className="size-3" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 text-[9px]">
                      <span className="text-muted-foreground">
                        Approval coverage
                      </span>
                      <span className="font-semibold tabular-nums text-blue-400">
                        {approvalRate}%
                      </span>
                    </div>

                    <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-blue-400"
                        style={{ width: `${approvalRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid min-w-0 grid-cols-2 gap-px border-b border-border/60 bg-border/60 p-px sm:grid-cols-3 xl:border-b-0 xl:border-r">
              {pipelineStages.map((stage, index) => (
                <ProcurementStage
                  key={stage.key}
                  index={index}
                  label={stage.label}
                  description={stage.description}
                  value={stage.value}
                  total={summary.total}
                  icon={stage.icon}
                  tone={stage.tone}
                />
              ))}
            </div>

            <div className="relative min-h-[178px] overflow-hidden p-4">
              <Banknote className="pointer-events-none absolute -bottom-6 -right-5 size-28 text-emerald-400 opacity-[0.035]" />

              <div className="relative">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
                      Committed procurement
                    </p>

                    <p className="mt-2 truncate text-xl font-semibold tabular-nums text-emerald-400">
                      {formatCurrency(summary.total_value)}
                    </p>
                  </div>

                  <span className="inline-flex size-8 items-center justify-center rounded-lg border border-emerald-500/15 bg-emerald-500/10 text-emerald-400">
                    <CircleDollarSign className="size-4" />
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 overflow-hidden rounded-xl border border-border/60 bg-background/35">
                  <CommandMetric
                    label="Open orders"
                    value={formatNumber(openOrders)}
                    detail={`${activeShare}% active share`}
                    icon={ShoppingCart}
                    tone="cyan"
                  />

                  <CommandMetric
                    label="Supplier base"
                    value={formatNumber(suppliers.length)}
                    detail={`${formatNumber(warehouses.length)} warehouses`}
                    icon={Truck}
                    tone="emerald"
                    last
                  />
                </div>

                <div className="mt-3 flex items-center justify-between rounded-lg border border-violet-500/10 bg-violet-500/[0.055] px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex size-6 items-center justify-center rounded-md bg-violet-500/10 text-violet-400">
                      <Boxes className="size-3" />
                    </span>
                    <span className="text-[9px] text-muted-foreground">
                      Products ready for ordering
                    </span>
                  </div>

                  <span className="text-xs font-semibold tabular-nums text-violet-400">
                    {formatNumber(products.length)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/*
                |--------------------------------------------------------------------------
                | Purchase order register
                |--------------------------------------------------------------------------
                */}

        <SectionCard
          title="Purchase Order Register"
          description="Supplier orders, delivery destinations, fulfillment progress, and approval controls."
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="h-6 rounded-full border-blue-500/15 bg-blue-500/[0.06] px-2.5 text-[9px] font-semibold text-blue-300"
              >
                {formatNumber(purchase_orders.total)} records
              </Badge>

              <Button
                type="button"
                onClick={openCreateDialog}
                className="h-9 rounded-lg px-3.5 text-xs shadow-[0_0_20px_rgba(34,211,238,0.08)]"
              >
                <Plus className="size-3.5" />
                New Purchase Order
              </Button>
            </div>
          }
        >
          <div className="grid overflow-hidden rounded-xl border border-border/60 bg-muted/[0.018] sm:grid-cols-2 xl:grid-cols-4">
            <RegisterSignal
              label="Awaiting approval"
              value={summary.pending}
              detail="Requires review"
              icon={Clock3}
              tone="amber"
            />

            <RegisterSignal
              label="Approved queue"
              value={summary.approved}
              detail="Ready for delivery"
              icon={CheckCircle2}
              tone="blue"
            />

            <RegisterSignal
              label="In receiving"
              value={summary.partially_received}
              detail="Partially fulfilled"
              icon={PackageOpen}
              tone="violet"
            />

            <RegisterSignal
              label="Warehouse coverage"
              value={warehouses.length}
              detail={`${suppliers.length} suppliers available`}
              icon={Warehouse}
              tone="emerald"
              last
            />
          </div>

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
              iconClassName="text-blue-400"
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
              iconClassName="text-violet-400"
            />
          </FilterBar>

          <DataTable
            data={purchase_orders.data}
            columns={columns}
            getRowKey={(purchaseOrder) => purchaseOrder.id}
            emptyIcon={ClipboardCheck}
            emptyTitle="No purchase orders found"
            emptyDescription="Create a draft purchase order to begin ordering inventory from your suppliers."
            emptyAction={
              <Button type="button" onClick={openCreateDialog}>
                <Plus className="size-4" />
                New Purchase Order
              </Button>
            }
            minWidth="1480px"
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
                        <div className="flex h-10 items-center rounded-lg border border-emerald-500/10 bg-emerald-500/[0.045] px-3 text-sm font-semibold tabular-nums text-emerald-400">
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

          <section className="overflow-hidden rounded-xl border border-emerald-500/15 bg-gradient-to-br from-emerald-500/[0.065] via-card to-card">
            <div className="flex items-center gap-3 border-b border-emerald-500/10 px-4 py-3">
              <span className="inline-flex size-8 items-center justify-center rounded-lg border border-emerald-500/15 bg-emerald-500/10 text-emerald-400">
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

              <div className="border-t border-emerald-500/10 pt-4">
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
| Procurement stage
|--------------------------------------------------------------------------
*/

function CompletionDonut({
  value,
  completed,
  total,
}: {
  value: number;
  completed: number;
  total: number;
}) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div className="relative flex size-[104px] shrink-0 items-center justify-center">
      <div
        className="absolute inset-0 rounded-full p-[8px] shadow-[0_0_28px_rgba(16,185,129,0.07)]"
        style={{
          background: `conic-gradient(rgb(52 211 153) ${safeValue}%, rgba(148,163,184,0.12) 0)`,
        }}
      >
        <div className="size-full rounded-full border border-emerald-500/10 bg-card" />
      </div>

      <div className="relative text-center">
        <p className="text-xl font-semibold leading-none tabular-nums text-emerald-400">
          {safeValue}%
        </p>
        <p className="mt-1 text-[8px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          Complete
        </p>
        <p className="mt-1 text-[8px] tabular-nums text-muted-foreground/75">
          {formatNumber(completed)}/{formatNumber(total)}
        </p>
      </div>
    </div>
  );
}

function ProcurementStage({
  index,
  label,
  description,
  value,
  total,
  icon: Icon,
  tone,
}: {
  index: number;
  label: string;
  description: string;
  value: number;
  total: number;
  icon: LucideIcon;
  tone: PipelineTone;
}) {
  const styles: Record<
    PipelineTone,
    {
      icon: string;
      value: string;
      bar: string;
      surface: string;
      watermark: string;
      stage: string;
      status: string;
    }
  > = {
    slate: {
      icon: "border-slate-500/20 bg-slate-500/10 text-slate-300 shadow-[0_0_18px_rgba(148,163,184,0.06)]",
      value: "text-slate-200",
      bar: "bg-slate-400",
      surface:
        "bg-[linear-gradient(145deg,rgba(148,163,184,0.055),transparent_58%)] hover:bg-slate-500/[0.055]",
      watermark: "text-slate-400",
      stage: "border-slate-500/15 bg-slate-500/[0.07] text-slate-300",
      status: "text-slate-300",
    },
    amber: {
      icon: "border-amber-500/20 bg-amber-500/10 text-amber-400 shadow-[0_0_18px_rgba(251,191,36,0.07)]",
      value: "text-amber-400",
      bar: "bg-amber-400",
      surface:
        "bg-[linear-gradient(145deg,rgba(251,191,36,0.065),transparent_58%)] hover:bg-amber-500/[0.055]",
      watermark: "text-amber-400",
      stage: "border-amber-500/15 bg-amber-500/[0.07] text-amber-300",
      status: "text-amber-400",
    },
    blue: {
      icon: "border-blue-500/20 bg-blue-500/10 text-blue-400 shadow-[0_0_18px_rgba(96,165,250,0.07)]",
      value: "text-blue-400",
      bar: "bg-blue-400",
      surface:
        "bg-[linear-gradient(145deg,rgba(96,165,250,0.065),transparent_58%)] hover:bg-blue-500/[0.055]",
      watermark: "text-blue-400",
      stage: "border-blue-500/15 bg-blue-500/[0.07] text-blue-300",
      status: "text-blue-400",
    },
    violet: {
      icon: "border-violet-500/20 bg-violet-500/10 text-violet-400 shadow-[0_0_18px_rgba(167,139,250,0.07)]",
      value: "text-violet-400",
      bar: "bg-violet-400",
      surface:
        "bg-[linear-gradient(145deg,rgba(167,139,250,0.065),transparent_58%)] hover:bg-violet-500/[0.055]",
      watermark: "text-violet-400",
      stage: "border-violet-500/15 bg-violet-500/[0.07] text-violet-300",
      status: "text-violet-400",
    },
    emerald: {
      icon: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.07)]",
      value: "text-emerald-400",
      bar: "bg-emerald-400",
      surface:
        "bg-[linear-gradient(145deg,rgba(52,211,153,0.065),transparent_58%)] hover:bg-emerald-500/[0.055]",
      watermark: "text-emerald-400",
      stage: "border-emerald-500/15 bg-emerald-500/[0.07] text-emerald-300",
      status: "text-emerald-400",
    },
    red: {
      icon: "border-red-500/20 bg-red-500/10 text-red-400 shadow-[0_0_18px_rgba(248,113,113,0.07)]",
      value: "text-red-400",
      bar: "bg-red-400",
      surface:
        "bg-[linear-gradient(145deg,rgba(248,113,113,0.06),transparent_58%)] hover:bg-red-500/[0.055]",
      watermark: "text-red-400",
      stage: "border-red-500/15 bg-red-500/[0.07] text-red-300",
      status: "text-red-400",
    },
  };

  const current = styles[tone];
  const share = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div
      className={cn(
        "group relative min-h-[118px] min-w-0 overflow-hidden bg-card/95 p-3.5 transition-all duration-200 hover:z-10 hover:-translate-y-px hover:shadow-lg",
        current.surface,
      )}
    >
      <Icon
        className={cn(
          "pointer-events-none absolute -bottom-4 -right-3 size-16 opacity-[0.045] transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-110 group-hover:opacity-[0.075]",
          current.watermark,
        )}
      />

      <div className="relative flex items-start justify-between gap-3">
        <span
          className={cn(
            "inline-flex h-5 items-center rounded-full border px-2 font-mono text-[8px] font-semibold tracking-[0.08em]",
            current.stage,
          )}
        >
          STAGE {String(index + 1).padStart(2, "0")}
        </span>

        <span
          className={cn(
            "inline-flex size-7 shrink-0 items-center justify-center rounded-lg border transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:rotate-3",
            current.icon,
          )}
        >
          <Icon className="size-3.5" />
        </span>
      </div>

      <div className="relative mt-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p
            className={cn(
              "text-[22px] font-semibold leading-none tabular-nums",
              current.value,
            )}
          >
            {formatNumber(value)}
          </p>

          <p className="mt-1.5 truncate text-[10px] font-semibold uppercase tracking-[0.08em] text-foreground/90">
            {label}
          </p>
        </div>

        <span
          className={cn(
            "shrink-0 text-[9px] font-semibold tabular-nums",
            current.status,
          )}
        >
          {share}%
        </span>
      </div>

      <p className="relative mt-1 truncate text-[8px] text-muted-foreground">
        {description}
      </p>

      <div className="relative mt-3">
        <div className="h-1.5 overflow-hidden rounded-full bg-background/70 ring-1 ring-border/40">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              current.bar,
            )}
            style={{
              width: share > 0 ? `${Math.max(8, share)}%` : "0%",
            }}
          />
        </div>

        <div className="mt-1.5 flex items-center justify-between gap-2 text-[8px]">
          <span className="text-muted-foreground/80">
            {value > 0
              ? `${formatNumber(value)} workflow record${value === 1 ? "" : "s"}`
              : "No active records"}
          </span>

          <span className="font-medium tabular-nums text-muted-foreground">
            of {formatNumber(total)}
          </span>
        </div>
      </div>
    </div>
  );
}

function CommandMetric({
  label,
  value,
  detail,
  icon: Icon,
  tone,
  last = false,
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone: "cyan" | "emerald";
  last?: boolean;
}) {
  const styles =
    tone === "cyan"
      ? { icon: "bg-cyan-500/10 text-cyan-400", value: "text-cyan-400" }
      : {
          icon: "bg-emerald-500/10 text-emerald-400",
          value: "text-emerald-400",
        };

  return (
    <div className={cn("min-w-0 p-3", !last && "border-r border-border/60")}>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "inline-flex size-6 items-center justify-center rounded-md",
            styles.icon,
          )}
        >
          <Icon className="size-3" />
        </span>
        <span className="truncate text-[8px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          {label}
        </span>
      </div>
      <p
        className={cn(
          "mt-2 text-base font-semibold tabular-nums",
          styles.value,
        )}
      >
        {value}
      </p>
      <p className="mt-1 truncate text-[8px] text-muted-foreground">{detail}</p>
    </div>
  );
}

function RegisterSignal({
  label,
  value,
  detail,
  icon: Icon,
  tone,
  last = false,
}: {
  label: string;
  value: number;
  detail: string;
  icon: LucideIcon;
  tone: "amber" | "blue" | "violet" | "emerald";
  last?: boolean;
}) {
  const styles = {
    amber: { icon: "bg-amber-500/10 text-amber-400", value: "text-amber-400" },
    blue: { icon: "bg-blue-500/10 text-blue-400", value: "text-blue-400" },
    violet: {
      icon: "bg-violet-500/10 text-violet-400",
      value: "text-violet-400",
    },
    emerald: {
      icon: "bg-emerald-500/10 text-emerald-400",
      value: "text-emerald-400",
    },
  }[tone];

  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-3 border-b border-border/60 px-3 py-2.5 sm:[&:nth-child(odd)]:border-r xl:border-b-0 xl:border-r xl:[&:nth-child(odd)]:border-r",
        last && "xl:border-r-0",
      )}
    >
      <span
        className={cn(
          "inline-flex size-8 shrink-0 items-center justify-center rounded-lg",
          styles.icon,
        )}
      >
        <Icon className="size-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[9px] font-medium text-muted-foreground">
            {label}
          </p>
          <p className={cn("text-sm font-semibold tabular-nums", styles.value)}>
            {formatNumber(value)}
          </p>
        </div>
        <p className="mt-0.5 truncate text-[8px] text-muted-foreground/75">
          {detail}
        </p>
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
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-emerald-400">
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
            ? "text-lg font-semibold tabular-nums text-emerald-400"
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
        description: `Submit ${number} for approval? The draft will move to the pending approval stage.`,
        confirmText: "Submit for Approval",
        destructive: false,
      };

    case "approve":
      return {
        title: "Approve Purchase Order",
        description: `Approve ${number}? Once approved, the order can proceed to supplier delivery and receiving.`,
        confirmText: "Approve Order",
        destructive: false,
      };

    case "cancel":
      return {
        title: "Cancel Purchase Order",
        description: `Cancel ${number}? This order will no longer continue through the procurement workflow.`,
        confirmText: "Cancel Order",
        destructive: true,
      };

    case "delete":
      return {
        title: "Delete Draft Purchase Order",
        description: `Delete ${number}? This draft and its item lines will be permanently removed.`,
        confirmText: "Delete Draft",
        destructive: true,
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