import { AppDrawer } from "@/components/shared/app-drawer";
import { AppPagination } from "@/components/shared/app-pagination";
import { CalloutCard } from "@/components/shared/callout-card";
import { EntityAvatar } from "@/components/shared/entity-avatar";
import { FormDialog } from "@/components/shared/form-dialog";
import { FilterBar } from "@/components/shared/filter-bar";
import { FormField } from "@/components/shared/form-field";
import { FormSection } from "@/components/shared/form-section";
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
  ArrowDownToLine,
  Banknote,
  Boxes,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  PackageCheck,
  Layers3,
  Plus,
  ReceiptText,
  RotateCcw,
  Clock3,
  ShieldCheck,
  Truck,
  Trash2,
  UserRound,
  Warehouse,
  XCircle,
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
};

type WarehouseOption = {
  id: number;
  branch_id: number;
  code: string;
  name: string;
  is_main: boolean;
};

type StatusOption = {
  value: string;
  label: string;
};

type PurchaseOrderItemOption = {
  id: number;
  product_id: number;
  product_name: string;
  product_sku: string | null;
  unit: string;
  ordered_quantity: number;
  received_quantity: number;
  remaining_quantity: number;
  unit_cost: number;
  notes: string | null;
  batch_tracking_enabled: boolean;
  batch_issue_policy: 'fifo' | 'fefo' | 'manual';
  requires_expiration_date: boolean;
  expiry_warning_days: number | null;
};

type PurchaseOrderOption = {
  id: number;
  po_number: string;
  order_date: string;
  expected_delivery_date: string | null;
  status: string;
  total_amount: number;

  supplier: {
    id: number;
    name: string;
    code: string | null;
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

  items: PurchaseOrderItemOption[];
};

type ReceiptItemBatch = {
  id: number;
  stock_batch_id: number;
  batch_code: string;
  lot_number: string | null;
  quantity_received: number;
  unit_cost: number;
  line_total: number;
  received_date: string | null;
  manufactured_date: string | null;
  expiration_date: string | null;
  status: string;
  stock_movement_batch_id: number | null;
  void_stock_movement_batch_id: number | null;
};

type ReceiptItem = {
  id: number;
  purchase_order_item_id: number;
  product_id: number;
  product_name: string;
  product_sku: string | null;
  unit: string;
  quantity_received: number;
  unit_cost: number;
  line_total: number;
  notes: string | null;
  stock_movement_id: number | null;
  void_stock_movement_id: number | null;
  batches: ReceiptItemBatch[];
};

type Receipt = {
  id: number;
  receipt_number: string;
  delivery_reference: string | null;
  received_date: string;
  status: string;
  status_label: string;
  can_void: boolean;

  purchase_order: {
    id: number;
    po_number: string;
  };

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

  items_count: number;
  total_quantity: number;
  total_amount: number;
  notes: string | null;

  received_by: UserReference | null;

  voided_by: UserReference | null;
  voided_at: string | null;
  void_reason: string | null;

  created_at: string | null;
  updated_at: string | null;

  items: ReceiptItem[];
};

type PaginationLink = {
  url: string | null;
  label: string;
  active: boolean;
};

type PaginatedReceipts = {
  current_page: number;
  data: Receipt[];
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

type ReceivingSummary = {
  total: number;
  posted: number;
  voided: number;
  received_quantity: number;
  received_value: number;
};

type ReceivingFilters = {
  search: string;
  status: string;
  supplier_id: string;
  warehouse_id: string;
  date_from: string;
  date_to: string;
};

type ReceivingBatchForm = {
  quantity: string;
  batch_code: string;
  lot_number: string;
  manufactured_date: string;
  expiration_date: string;
  notes: string;
};

type ReceivingFormItem = {
  purchase_order_item_id: string;
  quantity_received: string;
  notes: string;
  batches: ReceivingBatchForm[];
};

type ReceivingFormData = {
  purchase_order_id: string;
  delivery_reference: string;
  received_date: string;
  notes: string;
  items: ReceivingFormItem[];
};

type VoidReceiptFormData = {
  reason: string;
};

type ReceivingDrawerView = "all" | "posted" | "voided" | "ready";

type ReceivingPageProps = {
  receipts: PaginatedReceipts;
  summary: ReceivingSummary;
  suppliers: SupplierOption[];
  warehouses: WarehouseOption[];
  purchase_orders: PurchaseOrderOption[];
  statuses: StatusOption[];
  filters: ReceivingFilters;
};

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
  },
  {
    title: "Procurement",
    href: "/suppliers",
  },
  {
    title: "Receiving",
    href: "/suppliers/receiving",
  },
];

const NONE_VALUE = "none";

function todayDate(): string {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60_000;

  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function emptyBatch(): ReceivingBatchForm {
  return {
    quantity: '',
    batch_code: '',
    lot_number: '',
    manufactured_date: '',
    expiration_date: '',
    notes: '',
  };
}

function formItemFor(orderItem: PurchaseOrderItemOption): ReceivingFormItem {
  return {
    purchase_order_item_id: String(orderItem.id),
    quantity_received: '',
    notes: '',
    batches: orderItem.batch_tracking_enabled ? [emptyBatch()] : [],
  };
}

function emptyForm(): ReceivingFormData {
  return {
    purchase_order_id: "",
    delivery_reference: "",
    received_date: todayDate(),
    notes: "",
    items: [],
  };
}

export default function ReceivingIndex({
  receipts,
  summary,
  suppliers,
  warehouses,
  purchase_orders,
  statuses,
  filters,
}: ReceivingPageProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [viewingReceipt, setViewingReceipt] = useState<Receipt | null>(null);

  const [selectedReadyOrder, setSelectedReadyOrder] =
    useState<PurchaseOrderOption | null>(null);

  const [receivingDrawerView, setReceivingDrawerView] =
    useState<ReceivingDrawerView | null>(null);

  const [voidingReceipt, setVoidingReceipt] = useState<Receipt | null>(null);

  const [search, setSearch] = useState(filters.search ?? "");
  const [status, setStatus] = useState(filters.status ?? "");
  const [supplierId, setSupplierId] = useState(filters.supplier_id ?? "");
  const [warehouseId, setWarehouseId] = useState(filters.warehouse_id ?? "");
  const [dateFrom, setDateFrom] = useState(filters.date_from ?? "");
  const [dateTo, setDateTo] = useState(filters.date_to ?? "");

  const form = useForm<ReceivingFormData>(emptyForm());

  const voidForm = useForm<VoidReceiptFormData>({
    reason: "",
  });

  const voidErrors = voidForm.errors as Record<string, string | undefined>;

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

  useEffect(() => {
    const normalizedSearch = search.trim();

    if (
      normalizedSearch === (filters.search ?? "").trim() &&
      status === (filters.status ?? "") &&
      supplierId === (filters.supplier_id ?? "") &&
      warehouseId === (filters.warehouse_id ?? "") &&
      dateFrom === (filters.date_from ?? "") &&
      dateTo === (filters.date_to ?? "")
    ) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      router.get(
        "/suppliers/receiving",
        {
          search: normalizedSearch || undefined,
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
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [
    search,
    status,
    supplierId,
    warehouseId,
    dateFrom,
    dateTo,
    filters.search,
    filters.status,
    filters.supplier_id,
    filters.warehouse_id,
    filters.date_from,
    filters.date_to,
  ]);

  const selectedPurchaseOrder = useMemo(() => {
    return (
      purchase_orders.find(
        (order) => String(order.id) === form.data.purchase_order_id,
      ) ?? null
    );
  }, [form.data.purchase_order_id, purchase_orders]);

  const receiptTotals = useMemo(() => {
    if (!selectedPurchaseOrder) {
      return {
        quantity: 0,
        amount: 0,
        itemCount: 0,
      };
    }

    return form.data.items.reduce(
      (totals, item) => {
        const quantity = Number(item.quantity_received || 0);

        const orderItem = selectedPurchaseOrder.items.find(
          (candidate) => String(candidate.id) === item.purchase_order_item_id,
        );

        if (!orderItem || !Number.isFinite(quantity) || quantity <= 0) {
          return totals;
        }

        return {
          quantity: totals.quantity + quantity,

          amount: totals.amount + quantity * Number(orderItem.unit_cost),

          itemCount: totals.itemCount + 1,
        };
      },
      {
        quantity: 0,
        amount: 0,
        itemCount: 0,
      },
    );
  }, [form.data.items, selectedPurchaseOrder]);

  function openCreateModal(purchaseOrderId: number): void {
    const order =
      purchase_orders.find((item) => item.id === purchaseOrderId) ?? null;

    form.clearErrors();

    form.setData({
      ...emptyForm(),
      purchase_order_id: order ? String(order.id) : "",
      items: order?.items.map(formItemFor) ?? [],
    });

    setIsCreateModalOpen(true);
  }

  function closeCreateModal(): void {
    if (form.processing) {
      return;
    }

    setIsCreateModalOpen(false);
    form.clearErrors();
    form.setData(emptyForm());
  }

  function changePurchaseOrder(purchaseOrderId: string): void {
    const order = purchase_orders.find(
      (item) => String(item.id) === purchaseOrderId,
    );

    form.clearErrors();

    form.setData({
      ...form.data,

      purchase_order_id: purchaseOrderId,

      items: order?.items.map(formItemFor) ?? [],
    });
  }

  function updateItem(
    index: number,
    field: "quantity_received" | "notes",
    value: string,
  ): void {
    const items = [...form.data.items];
    const current = items[index];

    if (!current) {
      return;
    }

    const nextItem: ReceivingFormItem = {
      ...current,
      [field]: value,
    };

    if (
      field === "quantity_received" &&
      nextItem.batches.length === 1
    ) {
      nextItem.batches = [
        {
          ...nextItem.batches[0],
          quantity: value,
        },
      ];
    }

    items[index] = nextItem;
    form.setData("items", items);
  }

  function updateBatchField(
    itemIndex: number,
    batchIndex: number,
    field: keyof ReceivingBatchForm,
    value: string,
  ): void {
    const items = [...form.data.items];
    const item = items[itemIndex];

    if (!item) {
      return;
    }

    const batches = [...item.batches];
    const batch = batches[batchIndex];

    if (!batch) {
      return;
    }

    batches[batchIndex] = {
      ...batch,
      [field]: value,
    };

    items[itemIndex] = { ...item, batches };
    form.setData("items", items);
  }

  function addBatch(itemIndex: number): void {
    const items = [...form.data.items];
    const item = items[itemIndex];

    if (!item) {
      return;
    }

    items[itemIndex] = {
      ...item,
      batches: [...item.batches, emptyBatch()],
    };

    form.setData("items", items);
  }

  function removeBatch(itemIndex: number, batchIndex: number): void {
    const items = [...form.data.items];
    const item = items[itemIndex];

    if (!item) {
      return;
    }

    const batches = item.batches.filter((_, index) => index !== batchIndex);

    items[itemIndex] = {
      ...item,
      batches: batches.length > 0 ? batches : [emptyBatch()],
    };

    form.setData("items", items);
  }

  function fillRemainingQuantities(): void {
    if (!selectedPurchaseOrder) {
      return;
    }

    form.setData(
      "items",
      form.data.items.map((item) => {
        const orderItem = selectedPurchaseOrder.items.find(
          (candidate) => String(candidate.id) === item.purchase_order_item_id,
        );
        const quantity = orderItem ? String(orderItem.remaining_quantity) : "";

        return {
          ...item,
          quantity_received: quantity,
          batches:
            item.batches.length === 1
              ? [{ ...item.batches[0], quantity }]
              : item.batches,
        };
      }),
    );
  }

  function clearQuantities(): void {
    form.setData(
      "items",
      form.data.items.map((item) => ({
        ...item,
        quantity_received: "",
        batches: item.batches.map((batch) => ({ ...batch, quantity: "" })),
      })),
    );
  }

  function itemError(
    index: number,
    field: "quantity_received" | "notes" | "batches",
  ): string | undefined {
    return (form.errors as Record<string, string>)[`items.${index}.${field}`];
  }

  function batchError(
    itemIndex: number,
    batchIndex: number,
    field: keyof ReceivingBatchForm,
  ): string | undefined {
    return (form.errors as Record<string, string>)[
      `items.${itemIndex}.batches.${batchIndex}.${field}`
    ];
  }

  function submitReceipt(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    form.clearErrors();

    const selectedItems = form.data.items.filter((item) => {
      const quantity = Number(item.quantity_received || 0);
      return Number.isFinite(quantity) && quantity > 0;
    });

    if (selectedItems.length === 0) {
      form.setError(
        "items",
        "Enter a received quantity for at least one product.",
      );
      return;
    }

    if (!selectedPurchaseOrder) {
      form.setError("purchase_order_id", "Select an approved purchase order.");
      return;
    }

    let hasBatchError = false;

    form.data.items.forEach((item, itemIndex) => {
      const quantity = Number(item.quantity_received || 0);
      if (!Number.isFinite(quantity) || quantity <= 0) {
        return;
      }

      const orderItem = selectedPurchaseOrder.items.find(
        (candidate) => String(candidate.id) === item.purchase_order_item_id,
      );

      if (!orderItem?.batch_tracking_enabled) {
        return;
      }

      const activeBatches = item.batches.filter((batch) => {
        const batchQuantity = Number(batch.quantity || 0);
        return Number.isFinite(batchQuantity) && batchQuantity > 0;
      });

      if (activeBatches.length === 0) {
        form.setError(
          `items.${itemIndex}.batches` as keyof ReceivingFormData,
          "Add at least one batch allocation for this tracked product.",
        );
        hasBatchError = true;
        return;
      }

      const allocated = activeBatches.reduce(
        (sum, batch) => sum + Number(batch.quantity || 0),
        0,
      );

      if (Math.abs(allocated - quantity) > 0.0001) {
        form.setError(
          `items.${itemIndex}.batches` as keyof ReceivingFormData,
          `Batch quantities must total ${formatQuantity(quantity)}.`,
        );
        hasBatchError = true;
      }

      activeBatches.forEach((batch, batchIndex) => {
        if (orderItem.requires_expiration_date && !batch.expiration_date) {
          form.setError(
            `items.${itemIndex}.batches.${batchIndex}.expiration_date` as keyof ReceivingFormData,
            "Expiration date is required for this product.",
          );
          hasBatchError = true;
        }
      });
    });

    if (hasBatchError) {
      return;
    }

    form.transform((data) => ({
      ...data,
      items: data.items
        .filter((item) => {
          const quantity = Number(item.quantity_received || 0);
          return Number.isFinite(quantity) && quantity > 0;
        })
        .map((item) => ({
          ...item,
          batches: item.batches.filter((batch) => {
            const quantity = Number(batch.quantity || 0);
            return Number.isFinite(quantity) && quantity > 0;
          }),
        })),
    }));

    form.post("/suppliers/receiving", {
      preserveScroll: true,
      onSuccess: () => {
        setIsCreateModalOpen(false);
        form.reset();
        form.setData(emptyForm());
      },
      onFinish: () => {
        form.transform((data) => data);
      },
    });
  }

  function openVoidModal(receipt: Receipt): void {
    if (!receipt.can_void) {
      return;
    }

    voidForm.clearErrors();
    voidForm.setData("reason", "");
    setViewingReceipt(null);
    setVoidingReceipt(receipt);
  }

  function closeVoidModal(): void {
    if (voidForm.processing) {
      return;
    }

    setVoidingReceipt(null);
    voidForm.clearErrors();
    voidForm.reset();
  }

  function submitVoidReceipt(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (!voidingReceipt) {
      return;
    }

    voidForm.post(`/suppliers/receiving/${voidingReceipt.id}/void`, {
      preserveScroll: true,
      onSuccess: () => {
        setVoidingReceipt(null);
        setViewingReceipt(null);
        voidForm.reset();
      },
    });
  }

  function openReadyOrderDetails(order: PurchaseOrderOption): void {
    setSelectedReadyOrder(order);
  }

  function closeReadyOrderDetails(): void {
    setSelectedReadyOrder(null);
  }

  function openReceivingDrawer(view: ReceivingDrawerView): void {
    setReceivingDrawerView(view);
  }

  function closeReceivingDrawer(): void {
    setReceivingDrawerView(null);
  }

  /*
    |--------------------------------------------------------------------------
    | Receiving overview
    |--------------------------------------------------------------------------
    */

  const readyOrderCount = purchase_orders.length;

  const pendingIntakeQuantity = purchase_orders.reduce(
    (orderTotal, order) =>
      orderTotal +
      order.items.reduce(
        (itemTotal, item) =>
          itemTotal + Number(item.remaining_quantity || 0),
        0,
      ),
    0,
  );

  const pendingIntakeValue = purchase_orders.reduce(
    (orderTotal, order) =>
      orderTotal +
      order.items.reduce(
        (itemTotal, item) =>
          itemTotal +
          Number(item.remaining_quantity || 0) *
            Number(item.unit_cost || 0),
        0,
      ),
    0,
  );

  const correctableReceipts = receipts.data.filter(
    (receipt) => receipt.status === "posted" && receipt.can_void,
  );

  const reversedReceipts = receipts.data.filter(
    (receipt) => receipt.status === "voided",
  );

  const correctionReceipts = receipts.data.filter(
    (receipt) => receipt.can_void || receipt.status === "voided",
  );

  const readyQueueProgress =
    readyOrderCount > 0
      ? Math.min(100, Math.max(12, readyOrderCount * 18))
      : 0;

  const correctionProgress =
    correctionReceipts.length > 0
      ? Math.min(100, Math.max(12, correctionReceipts.length * 20))
      : 0;

  const reversalProgress =
    summary.voided > 0
      ? Math.min(100, Math.max(12, summary.voided * 15))
      : 0;

  const receivingStatusLabel =
    readyOrderCount > 0
      ? `${formatNumber(readyOrderCount)} order${readyOrderCount === 1 ? "" : "s"} ready for intake`
      : correctableReceipts.length > 0
        ? `${formatNumber(correctableReceipts.length)} receipt${correctableReceipts.length === 1 ? "" : "s"} available for correction`
        : "Receiving queue clear";

  const receivingStatusClass =
    readyOrderCount > 0
      ? "border-amber-500/20 bg-amber-500/10 text-amber-300"
      : correctableReceipts.length > 0
        ? "border-blue-500/20 bg-blue-500/10 text-blue-300"
        : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";

  /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Receiving" />

      <PageContainer className="gap-4 md:gap-5">
        {/* Procurement receiving operations */}

        <section className="min-w-0 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.08] via-card/70 to-card/40">
          <div className="flex flex-col gap-3 border-b border-border/60 bg-background/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                <ArrowDownToLine className="size-4" />
              </span>

              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-foreground">
                  Receiving Operations Center
                </p>

                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  Process approved supplier deliveries and handle receipt corrections
                  without duplicating the completed-order archive.
                </p>
              </div>
            </div>

            <Badge
              variant="outline"
              className={cn(
                "h-6 w-fit shrink-0 rounded-full px-2.5 text-[9px] font-semibold",
                receivingStatusClass,
              )}
            >
              {readyOrderCount > 0 ? (
                <PackageCheck className="mr-1 size-3" />
              ) : correctableReceipts.length > 0 ? (
                <ReceiptText className="mr-1 size-3" />
              ) : (
                <ShieldCheck className="mr-1 size-3" />
              )}

              {receivingStatusLabel}
            </Badge>
          </div>

          <div className="grid min-w-0 lg:grid-cols-[minmax(330px,1.08fr)_minmax(0,1.92fr)]">
            <button
              type="button"
              onClick={() => openReceivingDrawer("ready")}
              className="relative overflow-hidden border-b border-border/60 p-4 text-left transition-colors hover:bg-primary/[0.025] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/35 lg:border-b-0 lg:border-r"
            >
              <div className="pointer-events-none absolute -right-14 -top-16 size-44 rounded-full bg-primary/10 blur-3xl" />
              <ArrowDownToLine className="pointer-events-none absolute -bottom-8 -right-5 size-28 text-primary opacity-[0.025]" />

              <div className="relative grid gap-4 sm:grid-cols-[64px_minmax(0,1fr)] sm:items-center">
                <div className="flex size-16 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/[0.08] text-amber-300">
                  <PackageCheck className="size-7" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-primary">
                        Ready for warehouse intake
                      </p>

                      <p className="mt-2 text-[27px] font-semibold leading-none tracking-[-0.04em]">
                        {formatNumber(readyOrderCount)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-semibold tabular-nums text-amber-300">
                        {formatQuantity(pendingIntakeQuantity)}
                      </p>

                      <p className="mt-1 text-[8px] uppercase tracking-wider text-muted-foreground">
                        Units pending
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-background/60">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all duration-500"
                      style={{ width: `${readyQueueProgress}%` }}
                    />
                  </div>

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[9px] text-muted-foreground">
                    <span>
                      Approved and partially received purchase orders
                    </span>

                    <span className="font-semibold tabular-nums text-primary">
                      {formatCurrency(pendingIntakeValue)}
                    </span>
                  </div>
                </div>
              </div>
            </button>

            <div className="grid min-w-0 sm:grid-cols-2 xl:grid-cols-4">
              <ReceivingNetworkMetric
                title="Ready Orders"
                value={formatNumber(readyOrderCount)}
                description="Supplier deliveries awaiting intake"
                footerLabel="Queue activity"
                footerValue={`${formatQuantity(pendingIntakeQuantity)} units`}
                footerProgress={readyQueueProgress}
                icon={PackageCheck}
                tone="amber"
                onClick={() => openReceivingDrawer("ready")}
                className="border-b border-border/60 sm:border-r xl:border-b-0"
              />

              <ReceivingNetworkMetric
                title="Pending Intake"
                value={formatQuantity(pendingIntakeQuantity)}
                description="Remaining quantity to receive"
                footerLabel="Estimated intake value"
                footerValue={formatCurrency(pendingIntakeValue)}
                footerProgress={readyQueueProgress}
                icon={Boxes}
                tone="blue"
                onClick={() => openReceivingDrawer("ready")}
                className="border-b border-border/60 xl:border-b-0 xl:border-r"
              />

              <ReceivingNetworkMetric
                title="Correctable Receipts"
                value={formatNumber(correctableReceipts.length)}
                description="Posted receipts still eligible for voiding"
                footerLabel="Operational records"
                footerValue={`${formatNumber(correctionReceipts.length)} loaded`}
                footerProgress={correctionProgress}
                icon={ReceiptText}
                tone="emerald"
                onClick={() => openReceivingDrawer("posted")}
                className="border-b border-border/60 sm:border-b-0 sm:border-r"
              />

              <ReceivingNetworkMetric
                title="Reversed Receipts"
                value={formatNumber(summary.voided)}
                description="Completed receipt reversals"
                footerLabel="Reversal audit"
                footerValue={`${formatNumber(reversedReceipts.length)} loaded`}
                footerProgress={reversalProgress}
                icon={RotateCcw}
                tone="red"
                onClick={() => openReceivingDrawer("voided")}
              />
            </div>
          </div>
        </section>

        {/* Receiving work queues */}

        <SectionCard
          title="Receiving Approval Queue"
          description="Approved and partially received purchase orders are listed here for warehouse receiving. Expand a row to review the ordered products before posting the delivery."
          actions={
            <Badge
              variant="outline"
              className="h-7 rounded-full border-emerald-500/20 bg-emerald-500/[0.07] px-2.5 text-[10px] font-medium text-emerald-300"
            >
              <PackageCheck className="mr-1 size-3" />
              {formatNumber(purchase_orders.length)} ready
            </Badge>
          }
        >
          <ReadyToReceiveTable
            purchaseOrders={purchase_orders}
            onSelect={openReadyOrderDetails}
          />
        </SectionCard>

        <SectionCard
          title="Receipt Corrections & Reversals"
          description="Only posted receipts still eligible for voiding and completed reversals appear here. Fully completed procurement history remains in Received Orders."
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="h-7 rounded-full border-blue-500/20 bg-blue-500/[0.06] px-2.5 text-[10px] font-medium text-blue-300"
              >
                <ReceiptText className="mr-1 size-3" />
                {formatNumber(correctableReceipts.length)} correctable
              </Badge>

              <Badge
                variant="outline"
                className="h-7 rounded-full border-red-500/20 bg-red-500/[0.06] px-2.5 text-[10px] font-medium text-red-300"
              >
                <RotateCcw className="mr-1 size-3" />
                {formatNumber(reversedReceipts.length)} reversed
              </Badge>
            </div>
          }
        >
          <CalloutCard
            tone="info"
            icon={ShieldCheck}
            title="Operational correction view"
            description="This section is for reversible posted receipts and completed reversals only. Use Received Orders for the completed procurement archive."
          />

          <FilterBar
            onSubmit={(event) => event.preventDefault()}
            contentClassName="grid w-full min-w-0 gap-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-[minmax(260px,1.2fr)_165px_190px_210px_minmax(360px,1.35fr)]"
          >
            <SearchInput
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onClear={() => setSearch("")}
              placeholder="Search receipt, PO, supplier, delivery reference..."
              className="sm:col-span-2 xl:col-span-1"
            />

            <Select
              value={status || NONE_VALUE}
              onValueChange={(value) => setStatus(value === NONE_VALUE ? "" : value)}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>All statuses</SelectItem>
                {statuses.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={supplierId || NONE_VALUE}
              onValueChange={(value) => setSupplierId(value === NONE_VALUE ? "" : value)}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="All suppliers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>All suppliers</SelectItem>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={String(supplier.id)}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={warehouseId || NONE_VALUE}
              onValueChange={(value) => setWarehouseId(value === NONE_VALUE ? "" : value)}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="All warehouses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>All warehouses</SelectItem>
                {warehouses.map((warehouse) => (
                  <SelectItem key={warehouse.id} value={String(warehouse.id)}>
                    {warehouse.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <ProcurementDateRangeFilter
              title="Receipt date"
              description="Show correction or reversal records received within this period."
              fromId="receipt_date_from"
              toId="receipt_date_to"
              fromValue={dateFrom}
              toValue={dateTo}
              onFromChange={setDateFrom}
              onToChange={setDateTo}
              className="md:col-span-2 xl:col-span-2 2xl:col-span-1"
            />
          </FilterBar>

          <ReceiptRegisterTable
            receipts={correctionReceipts}
            onSelect={setViewingReceipt}
          />

          <AppPagination pagination={receipts} itemLabel="receipt result pages" />
        </SectionCard>
      </PageContainer>

      <ReceivingOverviewDrawer
        view={receivingDrawerView}
        receipts={receipts}
        purchaseOrders={purchase_orders}
        onClose={closeReceivingDrawer}
      />

      <ReadyOrderDetailsDrawer
        order={selectedReadyOrder}
        onClose={closeReadyOrderDetails}
        onReceive={(order) => {
          closeReadyOrderDetails();
          openCreateModal(order.id);
        }}
      />

      {/* Receive supplier delivery */}

      <FormDialog
        open={isCreateModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeCreateModal();
          }
        }}
        title="Receive Supplier Delivery"
        description="Post delivered quantities from an approved purchase order into warehouse inventory."
        onSubmit={submitReceipt}
        processing={form.processing}
        submitText="Post Receipt"
        processingText="Posting Receipt..."
        maxWidth="max-w-6xl"
      >
        <FormSection
          title="Delivery Setup"
          description="Select the approved purchase order and record the supplier delivery reference."
          icon={<Truck />}
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <FormField
              id="purchase_order_id"
              label="Purchase Order"
              error={form.errors.purchase_order_id}
              required
            >
              <Select
                value={form.data.purchase_order_id || NONE_VALUE}
                disabled={form.processing}
                onValueChange={(value) =>
                  changePurchaseOrder(value === NONE_VALUE ? "" : value)
                }
              >
                <SelectTrigger id="purchase_order_id" className="w-full">
                  <SelectValue placeholder="Select purchase order" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value={NONE_VALUE}>
                    Select purchase order
                  </SelectItem>

                  {purchase_orders.map((order) => (
                    <SelectItem key={order.id} value={String(order.id)}>
                      {order.po_number} — {order.supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField
              id="received_date"
              label="Received Date"
              error={form.errors.received_date}
              required
            >
              <IconInput
                id="received_date"
                icon={CalendarDays}
                type="date"
                value={form.data.received_date}
                disabled={form.processing}
                onChange={(event) =>
                  form.setData("received_date", event.target.value)
                }
                iconClassName="group-focus-within:text-primary"
              />
            </FormField>

            <FormField
              id="delivery_reference"
              label="Delivery Reference"
              description="DR, invoice, or supplier document number."
              error={form.errors.delivery_reference}
            >
              <IconInput
                id="delivery_reference"
                icon={ReceiptText}
                type="text"
                value={form.data.delivery_reference}
                disabled={form.processing}
                onChange={(event) =>
                  form.setData("delivery_reference", event.target.value)
                }
                placeholder="DR-0001"
                autoComplete="off"
                iconClassName="group-focus-within:text-primary"
              />
            </FormField>
          </div>
        </FormSection>

        {selectedPurchaseOrder && (
          <section className="overflow-hidden rounded-xl border border-primary/10 bg-primary/[0.025]">
            <div className="flex flex-col gap-2 border-b border-border/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold">
                  {selectedPurchaseOrder.po_number}
                </p>
                <p className="mt-0.5 text-[9px] text-muted-foreground">
                  Approved supplier order selected for receiving
                </p>
              </div>

              <Badge
                variant="outline"
                className="h-6 w-fit rounded-full border-emerald-500/15 bg-emerald-500/10 px-2.5 text-[9px] text-emerald-300"
              >
                <PackageCheck className="mr-1 size-3" />
                READY TO RECEIVE
              </Badge>
            </div>

            <div className="grid sm:grid-cols-2 xl:grid-cols-4">
              <ReceiptContextMetric
                label="Supplier"
                value={selectedPurchaseOrder.supplier.name}
                detail={
                  selectedPurchaseOrder.supplier.code ?? "No supplier code"
                }
                icon={Truck}
                tone="amber"
                className="border-b border-border/60 sm:border-r xl:border-b-0"
              />

              <ReceiptContextMetric
                label="Receiving Warehouse"
                value={selectedPurchaseOrder.warehouse.name}
                detail={selectedPurchaseOrder.branch.name}
                icon={Warehouse}
                tone="violet"
                className="border-b border-border/60 xl:border-b-0 xl:border-r"
              />

              <ReceiptContextMetric
                label="Expected Delivery"
                value={formatDate(selectedPurchaseOrder.expected_delivery_date)}
                detail={formatDate(selectedPurchaseOrder.order_date)}
                icon={CalendarDays}
                tone="blue"
                className="border-b border-border/60 sm:border-b-0 sm:border-r"
              />

              <ReceiptContextMetric
                label="Purchase Value"
                value={formatCurrency(selectedPurchaseOrder.total_amount)}
                detail={`${selectedPurchaseOrder.items.length} order line${selectedPurchaseOrder.items.length === 1 ? "" : "s"}`}
                icon={Banknote}
                tone="emerald"
              />
            </div>
          </section>
        )}

        {selectedPurchaseOrder && (
          <FormSection
            title="Delivered Items"
            description="Enter the actual delivered quantity for every product included in this receipt."
            icon={<PackageCheck />}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="h-6 gap-1.5 rounded-full border-violet-500/15 bg-violet-500/10 px-2.5 text-[10px] text-violet-300"
                >
                  <Boxes className="size-3" />
                  {receiptTotals.itemCount} selected product
                  {receiptTotals.itemCount === 1 ? "" : "s"}
                </Badge>

                <Badge
                  variant="outline"
                  className="h-6 gap-1.5 rounded-full border-cyan-500/15 bg-cyan-500/10 px-2.5 text-[10px] text-cyan-300"
                >
                  <ArrowDownToLine className="size-3" />
                  {formatQuantity(receiptTotals.quantity)} units
                </Badge>

                <Badge
                  variant="outline"
                  className="h-6 gap-1.5 rounded-full border-emerald-500/15 bg-emerald-500/10 px-2.5 text-[10px] text-emerald-300"
                >
                  <Banknote className="size-3" />
                  {formatCurrency(receiptTotals.amount)}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={fillRemainingQuantities}
                  disabled={form.processing}
                  className="h-9 px-3 text-xs"
                >
                  <ArrowDownToLine className="size-3.5" />
                  Receive All Remaining
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={clearQuantities}
                  disabled={form.processing}
                  className="h-9 px-3 text-xs"
                >
                  <RotateCcw className="size-3.5" />
                  Clear
                </Button>
              </div>
            </div>

            {form.errors.items && (
              <p className="rounded-lg border border-destructive/15 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {form.errors.items}
              </p>
            )}

            <div className="app-scrollbar-thin overflow-x-auto rounded-xl border border-border/60">
              <table className="w-full min-w-[1050px] text-left">
                <thead className="border-b bg-muted/35">
                  <tr className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Product</th>
                    <th className="w-28 px-4 py-3 font-medium">Ordered</th>
                    <th className="w-32 px-4 py-3 font-medium">Received</th>
                    <th className="w-28 px-4 py-3 font-medium">Remaining</th>
                    <th className="w-40 px-4 py-3 font-medium">Receive Now</th>
                    <th className="w-40 px-4 py-3 font-medium">Line Value</th>
                    <th className="px-4 py-3 font-medium">Notes</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {selectedPurchaseOrder.items.map((orderItem, index) => {
                    const formItem = form.data.items[index];
                    const quantity = Number(formItem?.quantity_received || 0);
                    const lineTotal = Number.isFinite(quantity)
                      ? quantity * Number(orderItem.unit_cost)
                      : 0;
                    const exceedsRemaining =
                      quantity > Number(orderItem.remaining_quantity);
                    const allocatedBatchQuantity = (formItem?.batches ?? []).reduce(
                      (sum, batch) => {
                        const batchQuantity = Number(batch.quantity || 0);
                        return Number.isFinite(batchQuantity)
                          ? sum + batchQuantity
                          : sum;
                      },
                      0,
                    );
                    const batchDifference = quantity - allocatedBatchQuantity;

                    return (
                      <Fragment key={orderItem.id}>
                        <tr className="align-top transition hover:bg-muted/[0.025]">
                          <td className="px-4 py-3">
                            <div className="flex items-start gap-2.5">
                              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/10 text-primary">
                                <Boxes className="size-4" />
                              </span>

                              <div className="min-w-0">
                                <p className="max-w-[230px] truncate text-[12px] font-semibold">
                                  {orderItem.product_name}
                                </p>

                                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                  <span className="font-mono text-[9px] text-muted-foreground">
                                    {orderItem.product_sku ?? "NO SKU"} · {orderItem.unit}
                                  </span>

                                  {orderItem.batch_tracking_enabled && (
                                    <Badge
                                      variant="outline"
                                      className="h-5 border-cyan-500/25 bg-cyan-500/10 px-1.5 text-[8px] text-cyan-300"
                                    >
                                      <Layers3 className="mr-1 size-2.5" />
                                      Batch tracked
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <p className="text-[12px] font-semibold tabular-nums">
                              {formatQuantity(orderItem.ordered_quantity)}
                            </p>
                            <p className="mt-1 text-[9px] text-muted-foreground">
                              {orderItem.unit}
                            </p>
                          </td>

                          <td className="px-4 py-3">
                            <p className="text-[12px] tabular-nums text-muted-foreground">
                              {formatQuantity(orderItem.received_quantity)}
                            </p>
                          </td>

                          <td className="px-4 py-3">
                            <p className="text-[12px] font-semibold tabular-nums text-amber-400">
                              {formatQuantity(orderItem.remaining_quantity)}
                            </p>
                          </td>

                          <td className="px-4 py-3">
                            <Input
                              type="number"
                              min="0"
                              max={orderItem.remaining_quantity}
                              step="0.001"
                              value={formItem?.quantity_received ?? ""}
                              disabled={form.processing}
                              onChange={(event) =>
                                updateItem(
                                  index,
                                  "quantity_received",
                                  event.target.value,
                                )
                              }
                              placeholder="0"
                              className={cn(
                                "tabular-nums",
                                exceedsRemaining &&
                                  "border-destructive focus-visible:ring-destructive/20",
                              )}
                            />

                            {exceedsRemaining && (
                              <p className="mt-1 text-[9px] text-destructive">
                                Maximum {formatQuantity(orderItem.remaining_quantity)}.
                              </p>
                            )}

                            {itemError(index, "quantity_received") && (
                              <p className="mt-1 text-[9px] text-destructive">
                                {itemError(index, "quantity_received")}
                              </p>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <div className="rounded-lg border border-primary/10 bg-primary/[0.035] px-3 py-2.5">
                              <p className="text-[11px] font-semibold tabular-nums text-primary">
                                {formatCurrency(lineTotal)}
                              </p>
                              <p className="mt-1 text-[8px] text-muted-foreground">
                                @ {formatCurrency(orderItem.unit_cost)}
                              </p>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <Input
                              type="text"
                              value={formItem?.notes ?? ""}
                              disabled={form.processing}
                              onChange={(event) =>
                                updateItem(index, "notes", event.target.value)
                              }
                              placeholder="Optional"
                            />

                            {itemError(index, "notes") && (
                              <p className="mt-1 text-[9px] text-destructive">
                                {itemError(index, "notes")}
                              </p>
                            )}
                          </td>
                        </tr>

                        {orderItem.batch_tracking_enabled && quantity > 0 && (
                          <tr className="bg-cyan-500/[0.025]">
                            <td colSpan={7} className="px-4 py-4">
                              <div className="rounded-xl border border-cyan-500/20 bg-card/55 p-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <Layers3 className="size-4 text-cyan-300" />
                                      <p className="text-[11px] font-semibold">
                                        Receiving Batch Layers
                                      </p>
                                    </div>
                                    <p className="mt-1 text-[9px] text-muted-foreground">
                                      Allocate the full received quantity into one or more cost layers.
                                      {orderItem.requires_expiration_date
                                        ? " Expiration date is required."
                                        : " Expiration date is optional."}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "border-border/70 bg-background/40 text-[9px]",
                                        Math.abs(batchDifference) <= 0.0001
                                          ? "text-emerald-300"
                                          : "text-amber-300",
                                      )}
                                    >
                                      Allocated {formatQuantity(allocatedBatchQuantity)} / {formatQuantity(quantity)}
                                    </Badge>

                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      disabled={form.processing}
                                      onClick={() => addBatch(index)}
                                      className="h-8 text-[9px]"
                                    >
                                      <Plus className="mr-1 size-3.5" />
                                      Add batch
                                    </Button>
                                  </div>
                                </div>

                                <div className="mt-3 space-y-3">
                                  {(formItem?.batches ?? []).map((batch, batchIndex) => (
                                    <div
                                      key={`${orderItem.id}-batch-${batchIndex}`}
                                      className="rounded-lg border border-border/60 bg-background/35 p-3"
                                    >
                                      <div className="mb-3 flex items-center justify-between">
                                        <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                                          Batch {batchIndex + 1}
                                        </p>
                                        <Button
                                          type="button"
                                          size="icon"
                                          variant="ghost"
                                          disabled={form.processing}
                                          onClick={() => removeBatch(index, batchIndex)}
                                          className="size-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                          aria-label={`Remove batch ${batchIndex + 1}`}
                                        >
                                          <Trash2 className="size-3.5" />
                                        </Button>
                                      </div>

                                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                                        <FormField
                                          id={`items_${index}_batches_${batchIndex}_quantity`}
                                          label="Quantity"
                                          required
                                          error={batchError(index, batchIndex, "quantity")}
                                        >
                                          <Input
                                            id={`items_${index}_batches_${batchIndex}_quantity`}
                                            type="number"
                                            min="0"
                                            step="0.001"
                                            value={batch.quantity}
                                            disabled={form.processing}
                                            onChange={(event) =>
                                              updateBatchField(
                                                index,
                                                batchIndex,
                                                "quantity",
                                                event.target.value,
                                              )
                                            }
                                            placeholder="0"
                                            className="tabular-nums"
                                          />
                                        </FormField>

                                        <FormField
                                          id={`items_${index}_batches_${batchIndex}_batch_code`}
                                          label="Batch Code"
                                          error={batchError(index, batchIndex, "batch_code")}
                                        >
                                          <Input
                                            id={`items_${index}_batches_${batchIndex}_batch_code`}
                                            value={batch.batch_code}
                                            disabled={form.processing}
                                            onChange={(event) =>
                                              updateBatchField(
                                                index,
                                                batchIndex,
                                                "batch_code",
                                                event.target.value,
                                              )
                                            }
                                            placeholder="Auto if blank"
                                          />
                                        </FormField>

                                        <FormField
                                          id={`items_${index}_batches_${batchIndex}_lot_number`}
                                          label="Lot Number"
                                          error={batchError(index, batchIndex, "lot_number")}
                                        >
                                          <Input
                                            id={`items_${index}_batches_${batchIndex}_lot_number`}
                                            value={batch.lot_number}
                                            disabled={form.processing}
                                            onChange={(event) =>
                                              updateBatchField(
                                                index,
                                                batchIndex,
                                                "lot_number",
                                                event.target.value,
                                              )
                                            }
                                            placeholder="Optional"
                                          />
                                        </FormField>

                                        <FormField
                                          id={`items_${index}_batches_${batchIndex}_manufactured_date`}
                                          label="Manufactured"
                                          error={batchError(index, batchIndex, "manufactured_date")}
                                        >
                                          <Input
                                            id={`items_${index}_batches_${batchIndex}_manufactured_date`}
                                            type="date"
                                            value={batch.manufactured_date}
                                            disabled={form.processing}
                                            onChange={(event) =>
                                              updateBatchField(
                                                index,
                                                batchIndex,
                                                "manufactured_date",
                                                event.target.value,
                                              )
                                            }
                                          />
                                        </FormField>

                                        <FormField
                                          id={`items_${index}_batches_${batchIndex}_expiration_date`}
                                          label="Expiration"
                                          required={orderItem.requires_expiration_date}
                                          error={batchError(index, batchIndex, "expiration_date")}
                                        >
                                          <Input
                                            id={`items_${index}_batches_${batchIndex}_expiration_date`}
                                            type="date"
                                            value={batch.expiration_date}
                                            disabled={form.processing}
                                            onChange={(event) =>
                                              updateBatchField(
                                                index,
                                                batchIndex,
                                                "expiration_date",
                                                event.target.value,
                                              )
                                            }
                                          />
                                        </FormField>

                                        <FormField
                                          id={`items_${index}_batches_${batchIndex}_notes`}
                                          label="Batch Notes"
                                          error={batchError(index, batchIndex, "notes")}
                                        >
                                          <Input
                                            id={`items_${index}_batches_${batchIndex}_notes`}
                                            value={batch.notes}
                                            disabled={form.processing}
                                            onChange={(event) =>
                                              updateBatchField(
                                                index,
                                                batchIndex,
                                                "notes",
                                                event.target.value,
                                              )
                                            }
                                            placeholder="Optional"
                                          />
                                        </FormField>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {itemError(index, "batches") && (
                                  <p className="mt-3 text-[9px] text-destructive">
                                    {itemError(index, "batches")}
                                  </p>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </FormSection>
        )}

        {selectedPurchaseOrder && (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <FormSection
              title="Receiving Notes"
              description="Record delivery condition, shortages, damages, or internal receiving remarks."
              icon={<ReceiptText />}
            >
              <FormField
                id="receiving_notes"
                label="Notes"
                error={form.errors.notes}
              >
                <Textarea
                  id="receiving_notes"
                  rows={6}
                  value={form.data.notes}
                  disabled={form.processing}
                  onChange={(event) =>
                    form.setData("notes", event.target.value)
                  }
                  placeholder="Delivery condition, shortages, damaged items, or other remarks"
                  className="resize-none"
                />
              </FormField>
            </FormSection>

            <section className="overflow-hidden rounded-xl border border-primary/15 bg-gradient-to-br from-primary/[0.07] via-card/70 to-card/40">
              <div className="border-b border-border/60 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex size-8 items-center justify-center rounded-lg border border-primary/15 bg-primary/10 text-primary">
                    <PackageCheck className="size-4" />
                  </span>

                  <div>
                    <p className="text-[11px] font-semibold">Receipt Summary</p>
                    <p className="mt-0.5 text-[9px] text-muted-foreground">
                      Inventory impact before posting
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-4">
                <ReceiptSummaryRow
                  label="Products"
                  value={formatNumber(receiptTotals.itemCount)}
                />
                <ReceiptSummaryRow
                  label="Total Quantity"
                  value={formatQuantity(receiptTotals.quantity)}
                />

                <div className="border-t border-border/60 pt-4">
                  <ReceiptSummaryRow
                    label="Total Value"
                    value={formatCurrency(receiptTotals.amount)}
                    strong
                  />
                </div>
              </div>
            </section>
          </div>
        )}
      </FormDialog>

      {/* Receipt details */}

      <AppDrawer
        open={viewingReceipt !== null}
        onOpenChange={(open) => {
          if (!open) {
            setViewingReceipt(null);
          }
        }}
        title={viewingReceipt?.receipt_number ?? "Receipt Details"}
        description={
          viewingReceipt
            ? `Purchase order ${viewingReceipt.purchase_order.po_number}`
            : "Supplier receiving details"
        }
        processing={false}
      >
        {viewingReceipt && (
          <div className="flex min-h-full flex-col">
            <div className="flex-1 space-y-4 p-5">
              <section className="overflow-hidden rounded-xl border border-primary/10 bg-primary/[0.025]">
                <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
                  <div>
                    <p className="text-[11px] font-semibold">
                      Receiving Record
                    </p>
                    <p className="mt-0.5 text-[9px] text-muted-foreground">
                      Posted warehouse intake and supplier reference
                    </p>
                  </div>

                  <StatusBadge
                    label={viewingReceipt.status_label}
                    variant={
                      viewingReceipt.status === "posted" ? "success" : "danger"
                    }
                  />
                </div>

                <div className="grid sm:grid-cols-2">
                  <ReceiptContextMetric
                    label="Supplier"
                    value={viewingReceipt.supplier.name}
                    detail={viewingReceipt.supplier.code ?? "No supplier code"}
                    icon={Truck}
                    tone="amber"
                    className="border-b border-border/60 sm:border-r"
                  />

                  <ReceiptContextMetric
                    label="Warehouse"
                    value={viewingReceipt.warehouse.name}
                    detail={viewingReceipt.branch.name}
                    icon={Warehouse}
                    tone="violet"
                    className="border-b border-border/60"
                  />

                  <ReceiptContextMetric
                    label="Received Date"
                    value={formatDate(viewingReceipt.received_date)}
                    detail={
                      viewingReceipt.delivery_reference ??
                      "No delivery reference"
                    }
                    icon={CalendarDays}
                    tone="blue"
                    className="sm:border-r"
                  />

                  <ReceiptContextMetric
                    label="Receipt Value"
                    value={formatCurrency(viewingReceipt.total_amount)}
                    detail={`${formatQuantity(viewingReceipt.total_quantity)} units received`}
                    icon={Banknote}
                    tone="emerald"
                  />
                </div>
              </section>

              <section className="overflow-hidden rounded-xl border border-border/60">
                <div className="border-b border-border/60 bg-muted/[0.025] px-4 py-3">
                  <p className="text-[11px] font-semibold">Received Items</p>
                  <p className="mt-0.5 text-[9px] text-muted-foreground">
                    Products applied to warehouse inventory
                  </p>
                </div>

                <div className="app-scrollbar-thin overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left">
                    <thead className="border-b bg-muted/35">
                      <tr className="text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
                        <th className="px-4 py-3 font-medium">Product</th>
                        <th className="px-4 py-3 font-medium">Quantity</th>
                        <th className="px-4 py-3 font-medium">Unit Cost</th>
                        <th className="px-4 py-3 font-medium">Line Total</th>
                        <th className="px-4 py-3 font-medium">Notes</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y">
                      {viewingReceipt.items.map((item) => (
                        <Fragment key={item.id}>
                          <tr>
                            <td className="px-4 py-3">
                              <p className="text-[11px] font-semibold">
                                {item.product_name}
                              </p>
                              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                <span className="font-mono text-[9px] text-muted-foreground">
                                  {item.product_sku ?? "NO SKU"} · {item.unit}
                                </span>
                                {item.batches.length > 0 && (
                                  <Badge
                                    variant="outline"
                                    className="h-5 border-cyan-500/25 bg-cyan-500/10 px-1.5 text-[8px] text-cyan-300"
                                  >
                                    <Layers3 className="mr-1 size-2.5" />
                                    {item.batches.length} batch{item.batches.length === 1 ? "" : "es"}
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-[11px] tabular-nums">
                              {formatQuantity(item.quantity_received)} {item.unit}
                            </td>
                            <td className="px-4 py-3 text-[11px] tabular-nums">
                              {formatCurrency(item.unit_cost)}
                            </td>
                            <td className="px-4 py-3 text-[11px] font-semibold tabular-nums text-primary">
                              {formatCurrency(item.line_total)}
                            </td>
                            <td className="max-w-[220px] px-4 py-3 text-[10px] text-muted-foreground">
                              {item.notes ?? "—"}
                            </td>
                          </tr>

                          {item.batches.length > 0 && (
                            <tr className="bg-cyan-500/[0.025]">
                              <td colSpan={5} className="px-4 py-3">
                                <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                                  {item.batches.map((batch) => (
                                    <div
                                      key={batch.id}
                                      className="rounded-lg border border-cyan-500/15 bg-background/40 p-3"
                                    >
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                          <p className="truncate font-mono text-[10px] font-semibold text-cyan-300">
                                            {batch.batch_code}
                                          </p>
                                          <p className="mt-1 text-[8px] text-muted-foreground">
                                            Lot {batch.lot_number ?? "—"} · {formatQuantity(batch.quantity_received)} {item.unit}
                                          </p>
                                        </div>
                                        <StatusBadge
                                          label={batch.status.replaceAll('_', ' ')}
                                          variant={batch.status === 'active' ? 'success' : 'warning'}
                                        />
                                      </div>

                                      <div className="mt-3 grid grid-cols-2 gap-2 text-[8px] text-muted-foreground">
                                        <span>Unit cost</span>
                                        <span className="text-right tabular-nums text-foreground">
                                          {formatCurrency(batch.unit_cost)}
                                        </span>
                                        <span>Manufactured</span>
                                        <span className="text-right text-foreground">
                                          {formatDate(batch.manufactured_date)}
                                        </span>
                                        <span>Expiration</span>
                                        <span className="text-right text-foreground">
                                          {formatDate(batch.expiration_date)}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <div className="grid gap-3 sm:grid-cols-2">
                <section className="rounded-xl border border-border/60 bg-muted/[0.02] p-4">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/10 text-primary">
                      <UserRound className="size-4" />
                    </span>
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
                        Received By
                      </p>
                      <p className="mt-1 text-[11px] font-semibold">
                        {viewingReceipt.received_by?.name ?? "Unknown user"}
                      </p>
                      <p className="mt-1 text-[9px] text-muted-foreground">
                        {formatDateTime(viewingReceipt.created_at)}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="rounded-xl border border-border/60 bg-muted/[0.02] p-4">
                  <p className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
                    Receiving Notes
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-[10px] leading-5">
                    {viewingReceipt.notes ?? "No receiving notes provided."}
                  </p>
                </section>
              </div>

              {viewingReceipt.status === "voided" && (
                <CalloutCard
                  tone="danger"
                  icon={XCircle}
                  title="Receipt reversed"
                  description={`${viewingReceipt.void_reason ?? "No void reason provided."} Reversed by ${viewingReceipt.voided_by?.name ?? "an unknown user"} on ${formatDateTime(viewingReceipt.voided_at)}.`}
                />
              )}
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-border/60 p-4 sm:flex-row sm:justify-end">
              {viewingReceipt.can_void && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => openVoidModal(viewingReceipt)}
                  className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-400"
                >
                  <RotateCcw className="size-4" />
                  Void Receipt
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={() => setViewingReceipt(null)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </AppDrawer>

      {/* Void receipt */}

      <FormDialog
        open={voidingReceipt !== null}
        onOpenChange={(open) => {
          if (!open) {
            closeVoidModal();
          }
        }}
        title="Void Receipt"
        description={
          voidingReceipt
            ? `Reverse ${voidingReceipt.receipt_number} and restore its previous inventory state.`
            : "Reverse a receiving record."
        }
        onSubmit={submitVoidReceipt}
        processing={voidForm.processing}
        submitText="Confirm Void"
        processingText="Voiding Receipt..."
        maxWidth="max-w-lg"
      >
        {voidingReceipt && (
          <>
            <CalloutCard
              tone="warning"
              icon={RotateCcw}
              title="This action creates a reversal record"
              description="The receipt remains in history as voided. Stock quantity, weighted average cost, and purchase-order received quantities are restored only when the receipt is safely reversible."
            />

            <section className="grid overflow-hidden rounded-xl border border-border/60 bg-muted/[0.02] sm:grid-cols-2">
              <ReceiptContextMetric
                label="Purchase Order"
                value={voidingReceipt.purchase_order.po_number}
                detail={voidingReceipt.supplier.name}
                icon={ClipboardList}
                tone="blue"
                className="border-b border-border/60 sm:border-r"
              />

              <ReceiptContextMetric
                label="Received Value"
                value={formatCurrency(voidingReceipt.total_amount)}
                detail={`${formatQuantity(voidingReceipt.total_quantity)} units`}
                icon={Banknote}
                tone="emerald"
                className="border-b border-border/60"
              />

              <ReceiptContextMetric
                label="Warehouse"
                value={voidingReceipt.warehouse.name}
                detail={voidingReceipt.branch.name}
                icon={Warehouse}
                tone="violet"
                className="sm:border-r"
              />

              <ReceiptContextMetric
                label="Received Date"
                value={formatDate(voidingReceipt.received_date)}
                detail={voidingReceipt.receipt_number}
                icon={CalendarDays}
                tone="amber"
              />
            </section>

            <FormField
              id="void_reason"
              label="Reason for voiding"
              description="Explain why this receiving record must be reversed."
              error={voidForm.errors.reason}
              required
            >
              <Textarea
                id="void_reason"
                rows={5}
                value={voidForm.data.reason}
                disabled={voidForm.processing}
                onChange={(event) =>
                  voidForm.setData("reason", event.target.value)
                }
                maxLength={1000}
                placeholder="Explain why this receipt must be reversed"
                className="resize-none"
              />
            </FormField>

            {(voidErrors.receipt || voidErrors.void) && (
              <p className="rounded-lg border border-destructive/15 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {voidErrors.receipt ?? voidErrors.void}
              </p>
            )}
          </>
        )}
      </FormDialog>
    </AppLayout>
  );
}

/*
|--------------------------------------------------------------------------
| Ready-to-receive table
|--------------------------------------------------------------------------
*/

function ReadyToReceiveTable({
  purchaseOrders,
  onSelect,
}: {
  purchaseOrders: PurchaseOrderOption[];
  onSelect: (order: PurchaseOrderOption) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-background/20 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse table-fixed">
          <thead className="border-b border-primary/10 bg-primary/[0.025]">
            <tr>
              <th className="w-[210px] px-4 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Purchase Order
              </th>
              <th className="w-[230px] px-4 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Supplier
              </th>
              <th className="w-[220px] px-4 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Destination
              </th>
              <th className="w-[190px] px-4 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Remaining
              </th>
              <th className="w-[150px] px-4 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Status
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border/60">
            {purchaseOrders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-14">
                  <div className="mx-auto flex max-w-sm flex-col items-center text-center">
                    <PackageCheck className="size-7 text-muted-foreground" />
                    <h3 className="mt-3 text-sm font-semibold">
                      No approved orders ready
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Approved or partially received orders will appear here.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              purchaseOrders.map((order) => {
                const remainingQuantity = order.items.reduce(
                  (sum, item) => sum + Number(item.remaining_quantity || 0),
                  0,
                );

                return (
                  <tr
                    key={order.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelect(order)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onSelect(order);
                      }
                    }}
                    className="group cursor-pointer bg-card/55 transition-colors hover:bg-primary/[0.035] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/35"
                  >
                    <td className="px-4 py-3">
                      <p className="font-mono text-[10px] font-semibold text-primary">
                        {order.po_number}
                      </p>
                      <p className="mt-1 text-[8px] text-muted-foreground">
                        Ordered {formatDate(order.order_date)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="truncate text-[11px] font-semibold">
                        {order.supplier.name}
                      </p>
                      <p className="mt-1 truncate font-mono text-[8px] text-muted-foreground">
                        {order.supplier.code ?? "No supplier code"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="truncate text-[10px] font-semibold">
                        {order.warehouse.name}
                      </p>
                      <p className="mt-1 truncate text-[8px] text-muted-foreground">
                        {order.branch.name}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[12px] font-semibold tabular-nums">
                        {formatQuantity(remainingQuantity)}
                      </p>
                      <p className="mt-1 text-[8px] text-muted-foreground">
                        {order.items.length} product line{order.items.length === 1 ? "" : "s"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <StatusBadge
                          label={
                            order.status === "partially_received"
                              ? "Partially Received"
                              : "Approved"
                          }
                          variant={
                            order.status === "partially_received"
                              ? "warning"
                              : "success"
                          }
                        />
                        <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary" />
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

function ReceiptRegisterTable({
  receipts,
  onSelect,
}: {
  receipts: Receipt[];
  onSelect: (receipt: Receipt) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-background/20 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse table-fixed">
          <thead className="border-b border-primary/10 bg-primary/[0.025]">
            <tr>
              <th className="w-[190px] px-4 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Receipt
              </th>
              <th className="w-[230px] px-4 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Supplier / PO
              </th>
              <th className="w-[210px] px-4 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Destination
              </th>
              <th className="w-[170px] px-4 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Quantity / Value
              </th>
              <th className="w-[140px] px-4 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Status
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border/60">
            {receipts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-14 text-center">
                  <ReceiptText className="mx-auto size-8 text-muted-foreground/50" />
                  <p className="mt-3 text-sm font-semibold">
                    No receiving records found
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Posted receipts will appear here with exact batch allocations.
                  </p>
                </td>
              </tr>
            ) : (
              receipts.map((receipt) => (
                <tr
                  key={receipt.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelect(receipt)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelect(receipt);
                    }
                  }}
                  className="group cursor-pointer bg-card/55 transition-colors hover:bg-primary/[0.035] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/35"
                >
                  <td className="px-4 py-3">
                    <p className="font-mono text-[10px] font-semibold text-primary">
                      {receipt.receipt_number}
                    </p>
                    <p className="mt-1 text-[8px] text-muted-foreground">
                      {formatDate(receipt.received_date)} · {receipt.delivery_reference ?? "No reference"}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="truncate text-[11px] font-semibold">
                      {receipt.supplier.name}
                    </p>
                    <p className="mt-1 truncate font-mono text-[8px] text-muted-foreground">
                      {receipt.purchase_order.po_number}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="truncate text-[10px] font-semibold">
                      {receipt.warehouse.name}
                    </p>
                    <p className="mt-1 truncate text-[8px] text-muted-foreground">
                      {receipt.branch.name}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[11px] font-semibold tabular-nums">
                      {formatQuantity(receipt.total_quantity)} units
                    </p>
                    <p className="mt-1 text-[9px] font-semibold tabular-nums text-primary">
                      {formatCurrency(receipt.total_amount)}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <StatusBadge
                        label={receipt.status_label}
                        variant={receipt.status === "posted" ? "success" : "danger"}
                      />
                      <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary" />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReceivingOverviewDrawer({
  view,
  receipts,
  purchaseOrders,
  onClose,
}: {
  view: ReceivingDrawerView | null;
  receipts: PaginatedReceipts;
  purchaseOrders: PurchaseOrderOption[];
  onClose: () => void;
}) {
  const [expandedReceiptId, setExpandedReceiptId] = useState<number | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const activeView = view ?? "all";

  useEffect(() => {
    setExpandedReceiptId(null);
    setExpandedOrderId(null);
  }, [view]);

  const correctableReceiptRecords = receipts.data.filter(
    (receipt) => receipt.status === "posted" && receipt.can_void,
  );

  const reversedReceiptRecords = receipts.data.filter(
    (receipt) => receipt.status === "voided",
  );

  const correctionReceiptRecords = receipts.data.filter(
    (receipt) => receipt.can_void || receipt.status === "voided",
  );

  const config = {
    all: {
      title: "Receipt Corrections & Reversals",
      description:
        "Operational receipt records loaded on the current page. Expand a record to inspect its correction or reversal context.",
      total: correctionReceiptRecords.length,
    },
    posted: {
      title: "Correctable Posted Receipts",
      description:
        "Posted receipts that are still eligible for safe reversal.",
      total: correctableReceiptRecords.length,
    },
    voided: {
      title: "Reversed Receipts",
      description:
        "Completed receiving reversals and their audit details.",
      total: reversedReceiptRecords.length,
    },
    ready: {
      title: "Orders Ready to Receive",
      description:
        "Approved and partially received purchase orders awaiting warehouse intake.",
      total: purchaseOrders.length,
    },
  }[activeView];

  const visibleReceipts =
    activeView === "posted"
      ? correctableReceiptRecords
      : activeView === "voided"
        ? reversedReceiptRecords
        : correctionReceiptRecords;

  return (
    <AppDrawer
      open={view !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={config.title}
      description={config.description}
      processing={false}
    >
      <div className="flex min-h-full flex-col bg-card">
        <div className="border-b border-primary/10 bg-gradient-to-br from-primary/[0.055] via-primary/[0.012] to-transparent px-5 py-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-3xl font-semibold leading-none tabular-nums text-primary">
                {formatNumber(config.total)}
              </p>
              <p className="mt-1 text-[9px] text-muted-foreground">
                Matching procurement records
              </p>
            </div>

            <Badge
              variant="outline"
              className="h-7 rounded-full border-primary/15 bg-primary/[0.055] px-2.5 text-[9px] text-primary"
            >
              Accordion view
            </Badge>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {activeView === "ready" ? (
            purchaseOrders.length === 0 ? (
              <ReceivingDrawerEmpty icon={PackageCheck} />
            ) : (
              <div className="space-y-2">
                {purchaseOrders.map((order) => {
                  const expanded = expandedOrderId === order.id;
                  const remainingQuantity = order.items.reduce(
                    (total, item) =>
                      total + Number(item.remaining_quantity || 0),
                    0,
                  );

                  return (
                    <article
                      key={order.id}
                      className={cn(
                        "overflow-hidden rounded-xl border bg-background/25 transition-colors",
                        expanded
                          ? "border-primary/25 bg-primary/[0.025]"
                          : "border-border/60",
                      )}
                    >
                      <button
                        type="button"
                        aria-expanded={expanded}
                        aria-controls={`receiving-ready-${order.id}`}
                        onClick={() =>
                          setExpandedOrderId((currentId) =>
                            currentId === order.id ? null : order.id,
                          )
                        }
                        className="flex w-full items-center gap-3 p-3 text-left transition hover:bg-primary/[0.035] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/35"
                      >
                        <EntityAvatar
                          icon={PackageCheck}
                          className="border-primary/15 bg-primary/[0.07] text-primary"
                        />

                        <div className="min-w-0 flex-1">
                          <p className="font-mono text-[10px] font-semibold text-primary">
                            {order.po_number}
                          </p>

                          <p className="mt-1 truncate text-[9px] text-muted-foreground">
                            {order.supplier.name} · {order.warehouse.name}
                          </p>
                        </div>

                        <ChevronRight
                          className={cn(
                            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                            expanded && "rotate-90 text-primary",
                          )}
                        />
                      </button>

                      {expanded && (
                        <div
                          id={`receiving-ready-${order.id}`}
                          className="border-t border-border/60 bg-card/20"
                        >
                          <div className="grid gap-2 p-3 sm:grid-cols-2">
                            <ReceivingAccordionMetric
                              label="Supplier"
                              value={order.supplier.name}
                              icon={Truck}
                            />

                            <ReceivingAccordionMetric
                              label="Warehouse"
                              value={order.warehouse.name}
                              icon={Warehouse}
                            />

                            <ReceivingAccordionMetric
                              label="Order date"
                              value={formatDate(order.order_date)}
                              icon={CalendarDays}
                            />

                            <ReceivingAccordionMetric
                              label="Expected delivery"
                              value={formatDate(order.expected_delivery_date)}
                              icon={CalendarDays}
                            />

                            <ReceivingAccordionMetric
                              label="Remaining quantity"
                              value={formatQuantity(remainingQuantity)}
                              icon={Boxes}
                              valueClassName="font-semibold tabular-nums text-amber-300"
                            />

                            <ReceivingAccordionMetric
                              label="Order total"
                              value={formatCurrency(order.total_amount)}
                              icon={Banknote}
                              valueClassName="font-semibold tabular-nums text-primary"
                            />
                          </div>

                          <div className="border-t border-border/50 p-3">
                            <p className="text-[8px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                              Products awaiting intake
                            </p>

                            <div className="mt-2 space-y-2">
                              {order.items.slice(0, 5).map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center justify-between gap-3 rounded-lg border border-border/40 bg-background/20 px-2.5 py-2"
                                >
                                  <div className="min-w-0">
                                    <p className="break-words text-[9px] font-semibold text-foreground/90">
                                      {item.product_name}
                                    </p>

                                    <p className="mt-0.5 font-mono text-[8px] text-muted-foreground">
                                      {item.product_sku ?? "NO SKU"}
                                    </p>
                                  </div>

                                  <div className="shrink-0 text-right">
                                    <p className="text-[9px] font-semibold tabular-nums text-amber-300">
                                      {formatQuantity(item.remaining_quantity)} remaining
                                    </p>

                                    <p className="mt-0.5 text-[8px] text-muted-foreground">
                                      {item.batch_tracking_enabled
                                        ? "Batch controlled"
                                        : "Standard stock"}
                                    </p>
                                  </div>
                                </div>
                              ))}

                              {order.items.length > 5 && (
                                <p className="text-[8px] text-muted-foreground">
                                  +{order.items.length - 5} more product line
                                  {order.items.length - 5 === 1 ? "" : "s"}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="border-t border-primary/10 bg-primary/[0.025] p-3">
                            <p className="text-[9px] leading-4 text-muted-foreground">
                              Use the main Ready-to-Receive table to open the complete order record and start the supplier delivery form.
                            </p>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )
          ) : visibleReceipts.length === 0 ? (
            <ReceivingDrawerEmpty icon={ReceiptText} />
          ) : (
            <div className="space-y-2">
              {visibleReceipts.map((receipt) => {
                const expanded = expandedReceiptId === receipt.id;

                return (
                  <article
                    key={receipt.id}
                    className={cn(
                      "overflow-hidden rounded-xl border bg-background/25 transition-colors",
                      expanded
                        ? "border-primary/25 bg-primary/[0.025]"
                        : "border-border/60",
                    )}
                  >
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={`receiving-receipt-${receipt.id}`}
                      onClick={() =>
                        setExpandedReceiptId((currentId) =>
                          currentId === receipt.id ? null : receipt.id,
                        )
                      }
                      className="flex w-full items-center gap-3 p-3 text-left transition hover:bg-primary/[0.035] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/35"
                    >
                      <EntityAvatar
                        icon={ReceiptText}
                        className="border-primary/15 bg-primary/[0.07] text-primary"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="font-mono text-[10px] font-semibold text-primary">
                            {receipt.receipt_number}
                          </p>

                          <StatusBadge
                            label={receipt.status_label}
                            variant={
                              receipt.status === "posted" ? "success" : "danger"
                            }
                          />
                        </div>

                        <p className="mt-1 truncate text-[9px] text-muted-foreground">
                          {receipt.supplier.name} ·{" "}
                          {formatCurrency(receipt.total_amount)}
                        </p>
                      </div>

                      <ChevronRight
                        className={cn(
                          "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                          expanded && "rotate-90 text-primary",
                        )}
                      />
                    </button>

                    {expanded && (
                      <div
                        id={`receiving-receipt-${receipt.id}`}
                        className="border-t border-border/60 bg-card/20"
                      >
                        <div className="grid gap-2 p-3 sm:grid-cols-2">
                          <ReceivingAccordionMetric
                            label="Purchase order"
                            value={receipt.purchase_order.po_number}
                            icon={ClipboardList}
                          />

                          <ReceivingAccordionMetric
                            label="Warehouse"
                            value={receipt.warehouse.name}
                            icon={Warehouse}
                          />

                          <ReceivingAccordionMetric
                            label="Received date"
                            value={formatDate(receipt.received_date)}
                            icon={CalendarDays}
                          />

                          <ReceivingAccordionMetric
                            label="Delivery reference"
                            value={receipt.delivery_reference ?? "Not provided"}
                            icon={ReceiptText}
                          />

                          <ReceivingAccordionMetric
                            label="Received quantity"
                            value={formatQuantity(receipt.total_quantity)}
                            icon={Boxes}
                          />

                          <ReceivingAccordionMetric
                            label="Receipt value"
                            value={formatCurrency(receipt.total_amount)}
                            icon={Banknote}
                            valueClassName="font-semibold tabular-nums text-primary"
                          />
                        </div>

                        <div className="border-t border-border/50 p-3">
                          <p className="text-[8px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                            Received product lines
                          </p>

                          <div className="mt-2 space-y-2">
                            {receipt.items.slice(0, 5).map((item) => (
                              <div
                                key={item.id}
                                className="rounded-lg border border-border/40 bg-background/20 px-2.5 py-2"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="break-words text-[9px] font-semibold text-foreground/90">
                                      {item.product_name}
                                    </p>

                                    <p className="mt-0.5 font-mono text-[8px] text-muted-foreground">
                                      {item.product_sku ?? "NO SKU"}
                                    </p>
                                  </div>

                                  <div className="shrink-0 text-right">
                                    <p className="text-[9px] font-semibold tabular-nums text-primary">
                                      {formatQuantity(item.quantity_received)} {item.unit}
                                    </p>

                                    <p className="mt-0.5 text-[8px] text-muted-foreground">
                                      {formatCurrency(item.line_total)}
                                    </p>
                                  </div>
                                </div>

                                {item.batches.length > 0 && (
                                  <p className="mt-2 text-[8px] text-muted-foreground">
                                    {item.batches.length} batch allocation
                                    {item.batches.length === 1 ? "" : "s"}
                                  </p>
                                )}
                              </div>
                            ))}

                            {receipt.items.length > 5 && (
                              <p className="text-[8px] text-muted-foreground">
                                +{receipt.items.length - 5} more product line
                                {receipt.items.length - 5 === 1 ? "" : "s"}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid gap-2 border-t border-border/50 bg-background/20 p-3 sm:grid-cols-2">
                          <ReceivingAccordionMetric
                            label="Received by"
                            value={receipt.received_by?.name ?? "Unknown user"}
                            icon={UserRound}
                          />

                          <ReceivingAccordionMetric
                            label="Recorded"
                            value={formatDateTime(receipt.created_at)}
                            icon={Clock3}
                          />
                        </div>

                        {receipt.status === "voided" && (
                          <div className="border-t border-red-500/15 bg-red-500/[0.035] p-3">
                            <p className="text-[8px] font-semibold uppercase tracking-[0.1em] text-red-300">
                              Reversal record
                            </p>

                            <p className="mt-1 text-[9px] leading-4 text-muted-foreground">
                              {receipt.void_reason ?? "No void reason provided."}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppDrawer>
  );
}

function ReceivingAccordionMetric({
  label,
  value,
  icon: Icon,
  valueClassName,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  valueClassName?: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-2.5 rounded-lg border border-border/50 bg-background/25 p-2.5">
      <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/[0.055] text-primary">
        <Icon className="size-3.5" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-[8px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">
          {label}
        </p>

        <p
          className={cn(
            "mt-1 break-words text-[10px] leading-4 text-foreground/85",
            valueClassName,
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function ReceivingDrawerEmpty({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-background/20 p-6 text-center">
      <Icon className="size-6 text-muted-foreground" />
      <p className="mt-3 text-sm font-semibold">No loaded matches</p>
    </div>
  );
}

function ReadyOrderDetailsDrawer({
  order,
  onClose,
  onReceive,
}: {
  order: PurchaseOrderOption | null;
  onClose: () => void;
  onReceive: (order: PurchaseOrderOption) => void;
}) {
  return (
    <AppDrawer
      open={order !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title="Approved Purchase Order"
      description="Review remaining product quantities before opening the supplier delivery form."
      processing={false}
    >
      {order && (
        <div className="flex min-h-full flex-col bg-card">
          <div className="min-h-0 flex-1 overflow-y-auto">
            <ReadyToReceiveExpandedDetails order={order} />
          </div>
          <div className="border-t border-border/60 bg-background/30 p-4">
            <Button
              type="button"
              onClick={() => onReceive(order)}
              className="h-10 w-full"
            >
              <ArrowDownToLine className="size-4" />
              Receive Supplier Delivery
            </Button>
          </div>
        </div>
      )}
    </AppDrawer>
  );
}

function ReadyToReceiveExpandedDetails({
  order,
}: {
  order: PurchaseOrderOption;
}) {
  const remainingQuantity = order.items.reduce(
    (total, item) => total + Number(item.remaining_quantity || 0),
    0,
  );

  return (
    <div className="overflow-hidden rounded-xl border border-primary/10 bg-background/45 shadow-sm">
      <div className="flex flex-col gap-2 border-b border-border/60 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
            Approved Order Details
          </p>

          <p className="mt-0.5 text-[9px] text-muted-foreground">
            Review the remaining ordered products before recording the supplier
            delivery.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="h-6 rounded-full border-border/70 bg-muted/20 px-2.5 font-mono text-[9px] text-muted-foreground"
          >
            {order.po_number}
          </Badge>

          <Badge
            variant="outline"
            className="h-6 rounded-full border-amber-500/20 bg-amber-500/10 px-2.5 text-[9px] font-semibold text-amber-300"
          >
            <ArrowDownToLine className="mr-1 size-3" />
            {formatQuantity(remainingQuantity)} remaining
          </Badge>
        </div>
      </div>

      <div className="grid gap-3 border-b border-border/60 p-3 md:grid-cols-2 xl:grid-cols-4">
        <ReceiptContextMetric
          label="Supplier"
          value={order.supplier.name}
          detail={order.supplier.code ?? "No supplier code"}
          icon={Truck}
          tone="amber"
        />

        <ReceiptContextMetric
          label="Receiving Warehouse"
          value={order.warehouse.name}
          detail={order.branch.name}
          icon={Warehouse}
          tone="violet"
        />

        <ReceiptContextMetric
          label="Expected Delivery"
          value={formatDate(order.expected_delivery_date)}
          detail={`Ordered ${formatDate(order.order_date)}`}
          icon={CalendarDays}
          tone="blue"
        />

        <ReceiptContextMetric
          label="Purchase Value"
          value={formatCurrency(order.total_amount)}
          detail={`${order.items.length} order line${order.items.length === 1 ? "" : "s"}`}
          icon={Banknote}
          tone="emerald"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left">
          <thead className="border-b bg-muted/25">
            <tr className="text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Ordered</th>
              <th className="px-4 py-3 font-medium">Received</th>
              <th className="px-4 py-3 font-medium">Remaining</th>
              <th className="px-4 py-3 font-medium">Unit Cost</th>
              <th className="px-4 py-3 font-medium">Notes</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border/50">
            {order.items.map((item) => (
              <tr key={item.id} className="hover:bg-muted/[0.025]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/10 text-primary">
                      <Boxes className="size-4" />
                    </span>

                    <div className="min-w-0">
                      <p className="max-w-[230px] truncate text-[11px] font-semibold">
                        {item.product_name}
                      </p>

                      <p className="mt-1 font-mono text-[9px] text-muted-foreground">
                        {item.product_sku ?? "NO SKU"} · {item.unit}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3 text-[11px] font-semibold tabular-nums">
                  {formatQuantity(item.ordered_quantity)}
                </td>

                <td className="px-4 py-3 text-[11px] tabular-nums text-muted-foreground">
                  {formatQuantity(item.received_quantity)}
                </td>

                <td className="px-4 py-3 text-[11px] font-semibold tabular-nums text-amber-400">
                  {formatQuantity(item.remaining_quantity)}
                </td>

                <td className="px-4 py-3 text-[11px] tabular-nums text-primary">
                  {formatCurrency(item.unit_cost)}
                </td>

                <td className="max-w-[230px] px-4 py-3 text-[10px] text-muted-foreground">
                  {item.notes ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Receiving network metric
|--------------------------------------------------------------------------
*/

type ReceivingMetricTone = "amber" | "blue" | "emerald" | "red";

function ReceivingNetworkMetric({
  title,
  value,
  description,
  footerLabel,
  footerValue,
  footerProgress,
  icon: Icon,
  tone,
  onClick,
  className,
}: {
  title: string;
  value: ReactNode;
  description: string;
  footerLabel: string;
  footerValue: ReactNode;
  footerProgress: number;
  icon: LucideIcon;
  tone: ReceivingMetricTone;
  onClick: () => void;
  className?: string;
}) {
  const toneStyles = {
    amber: {
      icon: "border-primary/20 bg-primary/10 text-primary",
      value: "text-primary",
      glow: "bg-primary/10",
      bar: "bg-primary",
    },
    blue: {
      icon: "border-primary/20 bg-primary/10 text-primary",
      value: "text-primary",
      glow: "bg-primary/10",
      bar: "bg-primary",
    },
    emerald: {
      icon: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
      value: "text-emerald-400",
      glow: "bg-emerald-500/10",
      bar: "bg-emerald-400",
    },
    red: {
      icon: "border-red-500/20 bg-red-500/10 text-red-400",
      value: "text-red-400",
      glow: "bg-red-500/10",
      bar: "bg-red-400",
    },
  } as const;

  const styles = toneStyles[tone];
  const safeProgress = Math.min(100, Math.max(0, footerProgress));

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex min-h-[128px] min-w-0 flex-col overflow-hidden px-4 py-3.5 transition-colors hover:bg-muted/[0.025]",
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

          <div
            className={cn(
              "mt-2 truncate text-xl font-semibold leading-none tabular-nums",
              styles.value,
            )}
          >
            {value}
          </div>

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

      <div className="relative mt-auto pt-4">
        <div className="flex items-center justify-between gap-2 text-[8px]">
          <span className="truncate uppercase tracking-[0.08em] text-muted-foreground">
            {footerLabel}
          </span>

          <span
            className={cn("shrink-0 font-semibold tabular-nums", styles.value)}
          >
            {footerValue}
          </span>
        </div>

        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-background/70">
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-500",
              styles.bar,
            )}
            style={{ width: `${safeProgress}%` }}
          />
        </div>
      </div>
    </button>
  );
}

/*
|--------------------------------------------------------------------------
| Receipt context metric
|--------------------------------------------------------------------------
*/

type ReceiptContextTone = "amber" | "blue" | "emerald" | "violet";

function ReceiptContextMetric({
  label,
  value,
  detail,
  icon: Icon,
  tone,
  className,
}: {
  label: string;
  value: ReactNode;
  detail: string;
  icon: LucideIcon;
  tone: ReceiptContextTone;
  className?: string;
}) {
  const toneStyles = {
    amber: "border-primary/15 bg-primary/10 text-primary",
    blue: "border-primary/15 bg-primary/10 text-primary",
    emerald: "border-primary/15 bg-primary/10 text-primary",
    violet: "border-primary/15 bg-primary/10 text-primary",
  } as const;

  return (
    <div className={cn("min-w-0 p-4", className)}>
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "inline-flex size-8 shrink-0 items-center justify-center rounded-lg border",
            toneStyles[tone],
          )}
        >
          <Icon className="size-4" />
        </span>

        <div className="min-w-0">
          <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            {label}
          </p>
          <div className="mt-1 truncate text-[11px] font-semibold">{value}</div>
          <p className="mt-1 truncate text-[9px] text-muted-foreground">
            {detail}
          </p>
        </div>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Receipt summary row
|--------------------------------------------------------------------------
*/

function ReceiptSummaryRow({
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
        className={cn(
          "text-[10px]",
          strong ? "font-semibold text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
      </span>

      <span
        className={cn(
          "font-semibold tabular-nums",
          strong ? "text-lg text-primary" : "text-[12px]",
        )}
      >
        {value}
      </span>
    </div>
  );
}


function ProcurementDateRangeFilter({
  title,
  description,
  fromId,
  toId,
  fromValue,
  toValue,
  onFromChange,
  onToChange,
  className,
}: {
  title: string;
  description: string;
  fromId: string;
  toId: string;
  fromValue: string;
  toValue: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  className?: string;
}) {
  const hasDateFilter = Boolean(fromValue || toValue);

  function changeFromDate(value: string): void {
    onFromChange(value);

    if (value && toValue && toValue < value) {
      onToChange(value);
    }
  }

  function clearDateRange(): void {
    onFromChange("");
    onToChange("");
  }

  return (
    <section
      className={cn("min-w-0", className)}
      aria-label={title}
      title={description}
    >
      <div className="flex min-w-0 flex-col gap-1.5 rounded-lg border border-border/70 bg-background/25 p-1.5 transition-colors focus-within:border-primary/25 focus-within:bg-primary/[0.018] sm:h-10 sm:flex-row sm:items-center sm:gap-0 sm:p-0">
        <div className="flex h-8 shrink-0 items-center gap-2 rounded-md bg-primary/[0.055] px-2.5 text-primary sm:h-full sm:rounded-l-lg sm:rounded-r-none sm:border-r sm:border-border/60">
          <CalendarDays className="size-3.5 shrink-0" />

          <span className="whitespace-nowrap text-[9px] font-semibold text-foreground">
            {title}
          </span>
        </div>

        <label
          htmlFor={fromId}
          className="flex h-8 min-w-0 flex-1 items-center gap-1.5 rounded-md px-2 transition-colors hover:bg-primary/[0.025] sm:rounded-none"
        >
          <span className="shrink-0 text-[8px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            From
          </span>

          <input
            id={fromId}
            type="date"
            value={fromValue}
            aria-label={`${title}: start date`}
            onChange={(event) => changeFromDate(event.target.value)}
            className="h-7 min-w-0 flex-1 bg-transparent px-1 text-[10px] text-foreground outline-none [color-scheme:dark]"
          />
        </label>

        <span
          aria-hidden="true"
          className="hidden shrink-0 text-[11px] text-muted-foreground sm:inline-flex"
        >
          →
        </span>

        <label
          htmlFor={toId}
          className="flex h-8 min-w-0 flex-1 items-center gap-1.5 rounded-md px-2 transition-colors hover:bg-primary/[0.025] sm:rounded-none"
        >
          <span className="shrink-0 text-[8px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            To
          </span>

          <input
            id={toId}
            type="date"
            value={toValue}
            min={fromValue || undefined}
            aria-label={`${title}: end date`}
            onChange={(event) => onToChange(event.target.value)}
            className="h-7 min-w-0 flex-1 bg-transparent px-1 text-[10px] text-foreground outline-none [color-scheme:dark]"
          />
        </label>

        {hasDateFilter && (
          <button
            type="button"
            onClick={clearDateRange}
            aria-label={`Clear ${title.toLowerCase()}`}
            title={`Clear ${title.toLowerCase()}`}
            className="flex h-8 shrink-0 items-center justify-center rounded-md border border-border/60 bg-background/35 px-2.5 text-sm leading-none text-muted-foreground transition hover:border-primary/20 hover:bg-primary/[0.055] hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 sm:mr-1 sm:size-8 sm:px-0"
          >
            <span aria-hidden="true">×</span>
          </button>
        )}
      </div>

      <p className="sr-only">{description}</p>
    </section>
  );
}

/*
|--------------------------------------------------------------------------
| Formatting
|--------------------------------------------------------------------------
*/

function formatNumber(value: number | string | null): string {
  const number = Number(value ?? 0);

  return new Intl.NumberFormat("en-PH").format(
    Number.isFinite(number) ? number : 0,
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
    maximumFractionDigits: 3,
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

function formatDateTime(value: string | null): string {
  if (!value) {
    return "Not available";
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