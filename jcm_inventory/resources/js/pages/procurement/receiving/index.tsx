import { AppDrawer } from "@/components/shared/app-drawer";
import { CalloutCard } from "@/components/shared/callout-card";
import { EntityAvatar } from "@/components/shared/entity-avatar";
import { FormDialog } from "@/components/shared/form-dialog";
import { FormField } from "@/components/shared/form-field";
import { FormSection } from "@/components/shared/form-section";
import { IconInput } from "@/components/shared/icon-input";
import { PageContainer } from "@/components/shared/page-container";
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
import { Head, useForm } from "@inertiajs/react";
import {
  ArrowDownToLine,
  Banknote,
  Boxes,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  PackageCheck,
  ReceiptText,
  RotateCcw,
  ShieldCheck,
  Truck,
  UserRound,
  Warehouse,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import {
  Fragment,
  type FormEvent,
  type ReactNode,
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

type ReceivingFormItem = {
  purchase_order_item_id: string;
  quantity_received: string;
  notes: string;
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
    href: "/procurement/suppliers",
  },
  {
    title: "Receiving",
    href: "/procurement/receiving",
  },
];

const NONE_VALUE = "none";

function todayDate(): string {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60_000;

  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
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
  summary,
  purchase_orders,
}: ReceivingPageProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [viewingReceipt, setViewingReceipt] = useState<Receipt | null>(null);

  const [expandedPurchaseOrderId, setExpandedPurchaseOrderId] = useState<
    number | null
  >(null);

  const [voidingReceipt, setVoidingReceipt] = useState<Receipt | null>(null);

  const form = useForm<ReceivingFormData>(emptyForm());

  const voidForm = useForm<VoidReceiptFormData>({
    reason: "",
  });

  const voidErrors = voidForm.errors as Record<string, string | undefined>;

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
      items:
        order?.items.map((item) => ({
          purchase_order_item_id: String(item.id),
          quantity_received: "",
          notes: "",
        })) ?? [],
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

      items:
        order?.items.map((item) => ({
          purchase_order_item_id: String(item.id),

          quantity_received: "",

          notes: "",
        })) ?? [],
    });
  }

  function updateItem(
    index: number,
    field: keyof ReceivingFormItem,
    value: string,
  ): void {
    const items = [...form.data.items];

    items[index] = {
      ...items[index],
      [field]: value,
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

        return {
          ...item,

          quantity_received: orderItem
            ? String(orderItem.remaining_quantity)
            : "",
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
      })),
    );
  }

  function itemError(
    index: number,
    field: keyof ReceivingFormItem,
  ): string | undefined {
    return (form.errors as Record<string, string>)[`items.${index}.${field}`];
  }

  function submitReceipt(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

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

    form.clearErrors();

    form.transform((data) => ({
      ...data,
      items: data.items.filter((item) => {
        const quantity = Number(item.quantity_received || 0);

        return Number.isFinite(quantity) && quantity > 0;
      }),
    }));

    form.post("/procurement/receiving", {
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

    voidForm.post(`/procurement/receiving/${voidingReceipt.id}/void`, {
      preserveScroll: true,
      onSuccess: () => {
        setVoidingReceipt(null);
        setViewingReceipt(null);
        voidForm.reset();
      },
    });
  }

  function togglePurchaseOrderDetails(purchaseOrderId: number): void {
    setExpandedPurchaseOrderId((currentId) =>
      currentId === purchaseOrderId ? null : purchaseOrderId,
    );
  }

  /*
    |--------------------------------------------------------------------------
    | Receiving overview
    |--------------------------------------------------------------------------
    */

  const postedPercentage =
    summary.total > 0
      ? Math.min(100, Math.round((summary.posted / summary.total) * 100))
      : 0;

  const voidedPercentage =
    summary.total > 0
      ? Math.min(100, Math.round((summary.voided / summary.total) * 100))
      : 0;

  const averageReceivedValue =
    summary.posted > 0 ? summary.received_value / summary.posted : 0;

  const receivingStatusLabel =
    summary.total === 0
      ? "No receiving history"
      : summary.voided > 0
        ? `${formatNumber(summary.voided)} reversed receipt${summary.voided === 1 ? "" : "s"}`
        : purchase_orders.length > 0
          ? `${formatNumber(purchase_orders.length)} approved order${purchase_orders.length === 1 ? "" : "s"} ready`
          : "Receiving register healthy";

  const receivingStatusClass =
    summary.total === 0
      ? "border-slate-500/20 bg-slate-500/10 text-slate-300"
      : summary.voided > 0
        ? "border-red-500/20 bg-red-500/10 text-red-300"
        : purchase_orders.length > 0
          ? "border-amber-500/20 bg-amber-500/10 text-amber-300"
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
        {/* Procurement receiving overview */}

        <section className="min-w-0 overflow-hidden rounded-2xl border border-amber-500/15 bg-gradient-to-br from-amber-500/[0.07] via-card/70 to-card/40">
          <div className="flex flex-col gap-3 border-b border-border/60 bg-background/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
                <ArrowDownToLine className="size-4" />
              </span>

              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-foreground">
                  Procurement Receiving Flow
                </p>

                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  Approved orders ready for intake, posted deliveries, warehouse
                  stock updates, and reversal health.
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
              {summary.total === 0 ? (
                <ReceiptText className="mr-1 size-3" />
              ) : summary.voided > 0 ? (
                <RotateCcw className="mr-1 size-3" />
              ) : purchase_orders.length > 0 ? (
                <PackageCheck className="mr-1 size-3" />
              ) : (
                <ShieldCheck className="mr-1 size-3" />
              )}

              {receivingStatusLabel}
            </Badge>
          </div>

          <div className="grid min-w-0 lg:grid-cols-[minmax(330px,1.08fr)_minmax(0,1.92fr)]">
            <div className="relative overflow-hidden border-b border-border/60 p-4 lg:border-b-0 lg:border-r">
              <div className="pointer-events-none absolute -right-14 -top-16 size-44 rounded-full bg-amber-500/10 blur-3xl" />
              <ArrowDownToLine className="pointer-events-none absolute -bottom-8 -right-5 size-28 text-amber-400 opacity-[0.025]" />

              <div className="relative grid gap-4 sm:grid-cols-[64px_minmax(0,1fr)] sm:items-center">
                <div className="flex size-16 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-400 shadow-[inset_0_0_0_1px_rgba(245,158,11,0.04)]">
                  <PackageCheck className="size-7" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-amber-300">
                        Posted receipt integrity
                      </p>

                      <p className="mt-2 text-[27px] font-semibold leading-none tracking-[-0.04em]">
                        {formatNumber(summary.posted)}

                        <span className="mx-1.5 text-base font-medium text-muted-foreground">
                          /
                        </span>

                        {formatNumber(summary.total)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-semibold tabular-nums text-amber-400">
                        {postedPercentage}%
                      </p>

                      <p className="mt-1 text-[8px] uppercase tracking-wider text-muted-foreground">
                        Posted
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-background/60">
                    <div
                      className="h-full bg-emerald-400 transition-all duration-500"
                      style={{ width: `${postedPercentage}%` }}
                    />

                    <div
                      className="h-full bg-red-400 transition-all duration-500"
                      style={{ width: `${voidedPercentage}%` }}
                    />
                  </div>

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[9px] text-muted-foreground">
                    <span>
                      {formatQuantity(summary.received_quantity)} units received
                    </span>

                    <span>
                      {formatNumber(purchase_orders.length)} approved order
                      {purchase_orders.length === 1 ? "" : "s"} ready
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid min-w-0 sm:grid-cols-2 xl:grid-cols-4">
              <ReceivingNetworkMetric
                title="Receiving Records"
                value={formatNumber(summary.total)}
                description="Supplier delivery receipts"
                footerLabel="Posted share"
                footerValue={`${postedPercentage}%`}
                footerProgress={postedPercentage}
                icon={ReceiptText}
                tone="blue"
                className="border-b border-border/60 sm:border-r xl:border-b-0"
              />

              <ReceivingNetworkMetric
                title="Posted Receipts"
                value={formatNumber(summary.posted)}
                description="Applied to warehouse stock"
                footerLabel="Receipt integrity"
                footerValue={`${postedPercentage}%`}
                footerProgress={postedPercentage}
                icon={CheckCircle2}
                tone="emerald"
                className="border-b border-border/60 xl:border-b-0 xl:border-r"
              />

              <ReceivingNetworkMetric
                title="Reversed Receipts"
                value={formatNumber(summary.voided)}
                description="Voided receiving records"
                footerLabel="Reversal rate"
                footerValue={`${voidedPercentage}%`}
                footerProgress={voidedPercentage}
                icon={RotateCcw}
                tone="red"
                className="border-b border-border/60 sm:border-b-0 sm:border-r"
              />

              <ReceivingNetworkMetric
                title="Received Value"
                value={formatCurrency(summary.received_value)}
                description="Posted acquisition value"
                footerLabel="Average per posted receipt"
                footerValue={formatCurrency(averageReceivedValue)}
                footerProgress={postedPercentage}
                icon={Banknote}
                tone="amber"
              />
            </div>
          </div>
        </section>

        {/* Receiving register */}

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
            expandedPurchaseOrderId={expandedPurchaseOrderId}
            onToggleDetails={togglePurchaseOrderDetails}
            onReceive={openCreateModal}
          />
        </SectionCard>
      </PageContainer>

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
                iconClassName="group-focus-within:text-blue-400"
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
                iconClassName="group-focus-within:text-amber-400"
              />
            </FormField>
          </div>
        </FormSection>

        {selectedPurchaseOrder && (
          <section className="overflow-hidden rounded-xl border border-amber-500/10 bg-amber-500/[0.025]">
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

                    return (
                      <tr
                        key={orderItem.id}
                        className="align-top transition hover:bg-muted/[0.025]"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-start gap-2.5">
                            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-violet-500/15 bg-violet-500/10 text-violet-400">
                              <Boxes className="size-4" />
                            </span>

                            <div className="min-w-0">
                              <p className="max-w-[230px] truncate text-[12px] font-semibold">
                                {orderItem.product_name}
                              </p>

                              <p className="mt-1 font-mono text-[9px] text-muted-foreground">
                                {orderItem.product_sku ?? "NO SKU"} ·{" "}
                                {orderItem.unit}
                              </p>
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
                              Maximum{" "}
                              {formatQuantity(orderItem.remaining_quantity)}.
                            </p>
                          )}

                          {itemError(index, "quantity_received") && (
                            <p className="mt-1 text-[9px] text-destructive">
                              {itemError(index, "quantity_received")}
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <div className="rounded-lg border border-emerald-500/10 bg-emerald-500/[0.035] px-3 py-2.5">
                            <p className="text-[11px] font-semibold tabular-nums text-emerald-400">
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

            <section className="overflow-hidden rounded-xl border border-emerald-500/15 bg-gradient-to-br from-emerald-500/[0.07] via-card/70 to-card/40">
              <div className="border-b border-border/60 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex size-8 items-center justify-center rounded-lg border border-emerald-500/15 bg-emerald-500/10 text-emerald-400">
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
              <section className="overflow-hidden rounded-xl border border-amber-500/10 bg-amber-500/[0.025]">
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
                        <tr key={item.id}>
                          <td className="px-4 py-3">
                            <p className="text-[11px] font-semibold">
                              {item.product_name}
                            </p>
                            <p className="mt-1 font-mono text-[9px] text-muted-foreground">
                              {item.product_sku ?? "NO SKU"} · {item.unit}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-[11px] tabular-nums">
                            {formatQuantity(item.quantity_received)} {item.unit}
                          </td>
                          <td className="px-4 py-3 text-[11px] tabular-nums">
                            {formatCurrency(item.unit_cost)}
                          </td>
                          <td className="px-4 py-3 text-[11px] font-semibold tabular-nums text-emerald-400">
                            {formatCurrency(item.line_total)}
                          </td>
                          <td className="max-w-[220px] px-4 py-3 text-[10px] text-muted-foreground">
                            {item.notes ?? "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <div className="grid gap-3 sm:grid-cols-2">
                <section className="rounded-xl border border-border/60 bg-muted/[0.02] p-4">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-blue-500/15 bg-blue-500/10 text-blue-400">
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

type ReadyToReceiveTableProps = {
  purchaseOrders: PurchaseOrderOption[];
  expandedPurchaseOrderId: number | null;
  onToggleDetails: (purchaseOrderId: number) => void;
  onReceive: (purchaseOrderId: number) => void;
};

function ReadyToReceiveTable({
  purchaseOrders,
  expandedPurchaseOrderId,
  onToggleDetails,
  onReceive,
}: ReadyToReceiveTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-background/20">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1120px] border-collapse">
          <thead className="select-none border-b border-border/70 bg-muted/20">
            <tr>
              <th scope="col" className="w-11 px-3 py-2.5 text-left">
                <span className="sr-only">Expand details</span>
              </th>

              <th
                scope="col"
                className="min-w-[205px] px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
              >
                Purchase Order
              </th>

              <th
                scope="col"
                className="min-w-[185px] px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
              >
                Supplier
              </th>

              <th
                scope="col"
                className="min-w-[215px] px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
              >
                Destination
              </th>

              <th
                scope="col"
                className="min-w-[170px] px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
              >
                Delivery Schedule
              </th>

              <th
                scope="col"
                className="min-w-[190px] px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
              >
                Remaining Summary
              </th>

              <th
                scope="col"
                className="min-w-[125px] px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
              >
                Status
              </th>

              <th
                scope="col"
                className="w-[120px] px-3 py-2.5 text-right text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
              >
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border/60">
            {purchaseOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12">
                  <div className="mx-auto flex max-w-sm flex-col items-center text-center">
                    <span className="flex size-11 items-center justify-center rounded-xl border border-emerald-500/15 bg-emerald-500/10 text-emerald-400">
                      <PackageCheck className="size-5" />
                    </span>

                    <h3 className="mt-3 text-sm font-semibold">
                      No approved purchase orders
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Approved and partially received purchase orders will
                      appear here when they are ready for warehouse receiving.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              purchaseOrders.map((order) => {
                const isExpanded = expandedPurchaseOrderId === order.id;
                const detailsId = `receiving-order-details-${order.id}`;

                const remainingQuantity = order.items.reduce(
                  (total, item) => total + Number(item.remaining_quantity || 0),
                  0,
                );

                const receivedQuantity = order.items.reduce(
                  (total, item) => total + Number(item.received_quantity || 0),
                  0,
                );

                const orderedQuantity = order.items.reduce(
                  (total, item) => total + Number(item.ordered_quantity || 0),
                  0,
                );

                return (
                  <Fragment key={order.id}>
                    <tr
                      tabIndex={0}
                      aria-expanded={isExpanded}
                      aria-controls={detailsId}
                      onClick={() => onToggleDetails(order.id)}
                      onKeyDown={(event) => {
                        if (event.target !== event.currentTarget) {
                          return;
                        }

                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onToggleDetails(order.id);
                        }
                      }}
                      className={cn(
                        "group cursor-pointer bg-card/10 transition-colors hover:bg-muted/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500/40",
                        isExpanded &&
                          "bg-emerald-500/[0.035] hover:bg-emerald-500/[0.055]",
                      )}
                    >
                      <td className="px-3 py-3 align-middle">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={
                            isExpanded
                              ? `Collapse ${order.po_number} details`
                              : `Expand ${order.po_number} details`
                          }
                          onClick={(event) => {
                            event.stopPropagation();
                            onToggleDetails(order.id);
                          }}
                          className={cn(
                            "size-7 rounded-md text-muted-foreground transition-colors hover:bg-emerald-500/10 hover:text-emerald-400",
                            isExpanded && "bg-emerald-500/10 text-emerald-400",
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
                            icon={ClipboardList}
                            className="border-emerald-500/15 bg-emerald-500/10 text-emerald-400 group-hover:border-emerald-500/25 group-hover:bg-emerald-500/15"
                          />

                          <div className="min-w-0">
                            <p className="max-w-[170px] truncate font-mono text-[10px] font-semibold text-emerald-300">
                              {order.po_number}
                            </p>

                            <p className="mt-1 text-[9px] text-muted-foreground">
                              Ordered {formatDate(order.order_date)}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-3.5 align-middle">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <EntityAvatar
                            icon={Truck}
                            className="border-amber-500/15 bg-amber-500/10 text-amber-400"
                          />

                          <div className="min-w-0">
                            <p className="max-w-[145px] truncate text-[10px] font-medium leading-4 text-foreground/85">
                              {order.supplier.name}
                            </p>

                            <p className="mt-1 truncate text-[9px] text-muted-foreground">
                              {order.supplier.code ?? "No supplier code"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-3.5 align-middle">
                        <div className="space-y-1.5">
                          <div className="flex min-w-0 items-center gap-2">
                            <Warehouse className="size-3.5 shrink-0 text-violet-400" />

                            <span className="max-w-[165px] truncate text-[10px] font-semibold text-foreground/90">
                              {order.warehouse.name}
                            </span>
                          </div>

                          <div className="flex min-w-0 items-center gap-2">
                            <Building2 className="size-3.5 shrink-0 text-blue-400" />

                            <span className="max-w-[165px] truncate text-[9px] text-muted-foreground">
                              {order.branch.name}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-3.5 align-middle">
                        <div className="space-y-1">
                          <p className="text-[10px] font-semibold text-foreground/90">
                            {formatDate(order.expected_delivery_date)}
                          </p>

                          <p className="text-[9px] text-muted-foreground">
                            Expected delivery
                          </p>
                        </div>
                      </td>

                      <td className="px-3 py-3.5 align-middle">
                        <div className="space-y-1">
                          <p className="text-[12px] font-semibold tabular-nums text-amber-400">
                            {formatQuantity(remainingQuantity)} units
                          </p>

                          <p className="text-[9px] text-muted-foreground">
                            {formatNumber(order.items.length)} product
                            {order.items.length === 1 ? "" : "s"} ·{" "}
                            {formatQuantity(receivedQuantity)} of{" "}
                            {formatQuantity(orderedQuantity)} received
                          </p>
                        </div>
                      </td>

                      <td className="px-3 py-3.5 align-middle">
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
                      </td>

                      <td className="px-3 py-3.5 text-right align-middle">
                        <div
                          className="inline-flex"
                          onClick={(event) => event.stopPropagation()}
                          onKeyDown={(event) => event.stopPropagation()}
                        >
                          <Button
                            type="button"
                            onClick={() => onReceive(order.id)}
                            className="h-8 rounded-lg px-3 text-[10px]"
                          >
                            <ArrowDownToLine className="size-3.5" />
                            Receive
                          </Button>
                        </div>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr id={detailsId} className="bg-muted/[0.08]">
                        <td colSpan={8} className="px-3 pb-3 pt-0">
                          <ReadyToReceiveExpandedDetails order={order} />
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
    <div className="overflow-hidden rounded-xl border border-emerald-500/10 bg-background/45 shadow-sm">
      <div className="flex flex-col gap-2 border-b border-border/60 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-300">
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
                    <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-violet-500/15 bg-violet-500/10 text-violet-400">
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

                <td className="px-4 py-3 text-[11px] tabular-nums text-emerald-400">
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
  className?: string;
}) {
  const toneStyles = {
    amber: {
      icon: "border-amber-500/20 bg-amber-500/10 text-amber-400",
      value: "text-amber-400",
      glow: "bg-amber-500/10",
      bar: "bg-amber-400",
    },
    blue: {
      icon: "border-blue-500/20 bg-blue-500/10 text-blue-400",
      value: "text-blue-400",
      glow: "bg-blue-500/10",
      bar: "bg-blue-400",
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
    <div
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
    </div>
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
    amber: "border-amber-500/15 bg-amber-500/10 text-amber-400",
    blue: "border-blue-500/15 bg-blue-500/10 text-blue-400",
    emerald: "border-emerald-500/15 bg-emerald-500/10 text-emerald-400",
    violet: "border-violet-500/15 bg-violet-500/10 text-violet-400",
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
          strong ? "text-lg text-emerald-400" : "text-[12px]",
        )}
      >
        {value}
      </span>
    </div>
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