import { AppPagination } from "@/components/shared/app-pagination";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EntityAvatar } from "@/components/shared/entity-avatar";
import { EntityInfo } from "@/components/shared/entity-info";
import { FilterBar } from "@/components/shared/filter-bar";
import { IconInput } from "@/components/shared/icon-input";
import { PageContainer } from "@/components/shared/page-container";
import { SearchInput } from "@/components/shared/search-input";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AppLayout from "@/layouts/app-layout";
import { cn } from "@/lib/utils";
import { type BreadcrumbItem } from "@/types";
import { Head, router } from "@inertiajs/react";
import {
  BadgeCheck,
  Banknote,
  Boxes,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  FileText,
  Hash,
  RotateCcw,
  ShieldCheck,
  Truck,
  Undo2,
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
};

type WarehouseOption = {
  id: number;
  branch_id: number;
  code: string;
  name: string;
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
  items: PurchaseOrderItem[];

  created_by: UserReference | null;
  submitted_by: UserReference | null;
  submitted_at: string | null;
  approved_by: UserReference | null;
  approved_at: string | null;

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

type ApprovalSummary = {
  pending_orders: number;
  pending_value: number;
  submitted_today: number;
  oldest_submitted_at: string | null;
};

type ApprovalFilters = {
  search: string;
  supplier_id: string;
  warehouse_id: string;
  date_from: string;
  date_to: string;
};

type ApprovalViewer = {
  is_owner: boolean;
  account_owner_id: number;
  product_id: number;
  subscription_id: number;
};

type PurchaseApprovalPageProps = {
  purchase_orders: PaginatedPurchaseOrders;
  summary: ApprovalSummary;
  suppliers: SupplierOption[];
  warehouses: WarehouseOption[];
  filters: ApprovalFilters;
  viewer: ApprovalViewer;
};

type ApprovalAction = "approve" | "return-to-draft";

type ApprovalActionTarget = {
  order: PurchaseOrder;
  action: ApprovalAction;
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
    title: "Purchase Approvals",
    href: "/suppliers/purchase-approvals",
  },
];

const ALL_VALUE = "all";

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function PurchaseApprovalIndex({
  purchase_orders,
  summary,
  suppliers,
  warehouses,
  filters,
  viewer,
}: PurchaseApprovalPageProps) {
  const [expandedPurchaseOrderId, setExpandedPurchaseOrderId] = useState<
    number | null
  >(null);

  const [actionTarget, setActionTarget] = useState<ApprovalActionTarget | null>(
    null,
  );

  const [actionProcessing, setActionProcessing] = useState(false);

  const [search, setSearch] = useState(filters.search ?? "");
  const [supplierId, setSupplierId] = useState(filters.supplier_id ?? "");
  const [warehouseId, setWarehouseId] = useState(filters.warehouse_id ?? "");
  const [dateFrom, setDateFrom] = useState(filters.date_from ?? "");
  const [dateTo, setDateTo] = useState(filters.date_to ?? "");

  useEffect(() => {
    setSearch(filters.search ?? "");
    setSupplierId(filters.supplier_id ?? "");
    setWarehouseId(filters.warehouse_id ?? "");
    setDateFrom(filters.date_from ?? "");
    setDateTo(filters.date_to ?? "");
  }, [
    filters.search,
    filters.supplier_id,
    filters.warehouse_id,
    filters.date_from,
    filters.date_to,
  ]);

  const hasActiveFilters = Boolean(
    search.trim() || supplierId || warehouseId || dateFrom || dateTo,
  );

  const oldestWaitingDays = useMemo(
    () => daysSince(summary.oldest_submitted_at),
    [summary.oldest_submitted_at],
  );

  const averageOrderValue =
    summary.pending_orders > 0
      ? summary.pending_value / summary.pending_orders
      : 0;

  const queueStatusLabel =
    summary.pending_orders === 0
      ? "Approval queue clear"
      : summary.pending_orders === 1
        ? "1 order awaiting review"
        : `${formatNumber(summary.pending_orders)} orders awaiting review`;

  const queueStatusClass =
    summary.pending_orders === 0
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
      : oldestWaitingDays >= 3
        ? "border-red-500/20 bg-red-500/10 text-red-300"
        : "border-amber-500/20 bg-amber-500/10 text-amber-300";

  const actionDialog = getApprovalActionDialog(actionTarget);

  function applyFilters(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    router.get(
      "/suppliers/purchase-approvals",
      {
        search: search.trim() || undefined,
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
    setSupplierId("");
    setWarehouseId("");
    setDateFrom("");
    setDateTo("");
    setExpandedPurchaseOrderId(null);

    router.get(
      "/suppliers/purchase-approvals",
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

  function requestApprovalAction(
    order: PurchaseOrder,
    action: ApprovalAction,
  ): void {
    setActionTarget({
      order,
      action,
    });
  }

  function executeApprovalAction(): void {
    if (!actionTarget || actionProcessing) {
      return;
    }

    const { order, action } = actionTarget;

    const endpoint =
      action === "approve"
        ? `/suppliers/purchase-approvals/${order.id}/approve`
        : `/suppliers/purchase-approvals/${order.id}/return-to-draft`;

    router.post(
      endpoint,
      {},
      {
        preserveScroll: true,
        onStart: () => setActionProcessing(true),
        onSuccess: () => {
          setActionTarget(null);
          setExpandedPurchaseOrderId(null);
        },
        onFinish: () => setActionProcessing(false),
      },
    );
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Purchase Approvals" />

      <PageContainer className="gap-4 md:gap-5">
        <section className="min-w-0 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.08] via-card/70 to-card/40">
          <div className="flex flex-col gap-3 border-b border-border/60 bg-background/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                <ShieldCheck className="size-4" />
              </span>

              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-foreground">
                  Owner Approval Queue
                </p>

                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  Review submitted supplier orders before they move to
                  receiving.
                </p>
              </div>
            </div>

            <Badge
              variant="outline"
              className={cn(
                "h-6 w-fit shrink-0 rounded-full px-2.5 text-[9px] font-semibold",
                queueStatusClass,
              )}
            >
              {summary.pending_orders === 0 ? (
                <CheckCircle2 className="mr-1 size-3" />
              ) : oldestWaitingDays >= 3 ? (
                <Clock3 className="mr-1 size-3" />
              ) : (
                <ClipboardCheck className="mr-1 size-3" />
              )}

              {queueStatusLabel}
            </Badge>
          </div>

          <div className="grid min-w-0 lg:grid-cols-[minmax(310px,1.05fr)_minmax(0,1.95fr)]">
            <div className="relative overflow-hidden border-b border-border/60 p-4 lg:border-b-0 lg:border-r">
              <div className="pointer-events-none absolute -right-16 -top-16 size-44 rounded-full bg-primary/10 blur-3xl" />
              <ShieldCheck className="pointer-events-none absolute -bottom-8 -right-5 size-28 text-primary opacity-[0.025]" />

              <div className="relative grid gap-4 sm:grid-cols-[64px_minmax(0,1fr)] sm:items-center">
                <div className="flex size-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                  <BadgeCheck className="size-7" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-primary">
                        Pending commitment
                      </p>

                      <p className="mt-2 text-[27px] font-semibold leading-none tracking-[-0.04em]">
                        {formatCurrency(summary.pending_value)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-semibold tabular-nums text-primary">
                        {formatNumber(summary.pending_orders)}
                      </p>

                      <p className="mt-1 text-[8px] uppercase tracking-wider text-muted-foreground">
                        Pending orders
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-background/60">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        oldestWaitingDays >= 3 ? "bg-red-400" : "bg-primary",
                      )}
                      style={{
                        width:
                          summary.pending_orders > 0
                            ? `${Math.min(100, Math.max(15, summary.pending_orders * 12))}%`
                            : "0%",
                      }}
                    />
                  </div>

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[9px] text-muted-foreground">
                    <span>
                      {summary.pending_orders > 0
                        ? `${formatCurrency(averageOrderValue)} average order`
                        : "No supplier commitment waiting"}
                    </span>

                    <span>
                      {summary.oldest_submitted_at
                        ? `Oldest waiting ${formatWaitingTime(oldestWaitingDays)}`
                        : "Queue currently clear"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid min-w-0 sm:grid-cols-2 xl:grid-cols-4">
              <ApprovalMetric
                title="Awaiting Approval"
                value={summary.pending_orders}
                description="Submitted purchase orders"
                footerLabel="Queue status"
                footerValue={
                  summary.pending_orders === 0 ? "Clear" : "Needs review"
                }
                icon={ClipboardCheck}
                tone="amber"
                className="border-b border-border/60 sm:border-r xl:border-b-0"
              />

              <ApprovalMetric
                title="Pending Value"
                value={formatCurrency(summary.pending_value)}
                description="Unapproved supplier commitment"
                footerLabel="Average order"
                footerValue={formatCurrency(averageOrderValue)}
                icon={CircleDollarSign}
                tone="emerald"
                className="border-b border-border/60 xl:border-b-0 xl:border-r"
              />

              <ApprovalMetric
                title="Submitted Today"
                value={summary.submitted_today}
                description="New orders added today"
                footerLabel="Daily intake"
                footerValue={
                  summary.submitted_today === 0 ? "No new orders" : "Active"
                }
                icon={CalendarDays}
                tone="blue"
                className="border-b border-border/60 sm:border-b-0 sm:border-r"
              />

              <ApprovalMetric
                title="Oldest Request"
                value={
                  summary.oldest_submitted_at
                    ? formatWaitingTime(oldestWaitingDays)
                    : "—"
                }
                description={
                  summary.oldest_submitted_at
                    ? formatDateTime(summary.oldest_submitted_at)
                    : "No pending submission"
                }
                footerLabel="Review priority"
                footerValue={
                  summary.oldest_submitted_at
                    ? oldestWaitingDays >= 3
                      ? "High"
                      : "Normal"
                    : "None"
                }
                icon={Clock3}
                tone={oldestWaitingDays >= 3 ? "red" : "violet"}
              />
            </div>
          </div>
        </section>

        <SectionCard
          title="Purchase Approval Register"
          description="Review submitted orders, inspect product lines and financial details, then approve or return the request for correction."
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="h-7 rounded-full border-amber-500/15 bg-amber-500/[0.06] px-2.5 text-[10px] font-medium text-amber-300"
              >
                <ShieldCheck className="mr-1 size-3" />
                Owner access
              </Badge>

              <Badge
                variant="outline"
                className="h-7 rounded-full border-violet-500/15 bg-violet-500/[0.06] px-2.5 text-[10px] font-medium text-violet-300"
              >
                <ClipboardCheck className="mr-1 size-3" />
                {formatNumber(purchase_orders.total)} request
                {purchase_orders.total === 1 ? "" : "s"}
              </Badge>
            </div>
          }
        >
          <FilterBar
            onSubmit={applyFilters}
            contentClassName="grid w-full min-w-0 gap-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-[minmax(240px,1fr)_190px_210px_155px_155px]"
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
                    {supplier.name} ({supplier.code})
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
              id="approval_date_from"
              icon={CalendarDays}
              type="date"
              value={dateFrom}
              title="Submitted date from"
              aria-label="Submitted date from"
              onChange={(event) => setDateFrom(event.target.value)}
              className="h-10"
              iconClassName="text-primary"
            />

            <IconInput
              id="approval_date_to"
              icon={CalendarDays}
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              title="Submitted date to"
              aria-label="Submitted date to"
              onChange={(event) => setDateTo(event.target.value)}
              className="h-10"
              iconClassName="text-primary"
            />
          </FilterBar>

          <PurchaseApprovalTable
            purchaseOrders={purchase_orders.data}
            expandedPurchaseOrderId={expandedPurchaseOrderId}
            onToggleDetails={togglePurchaseOrderDetails}
            onAction={requestApprovalAction}
          />

          <AppPagination
            pagination={purchase_orders}
            itemLabel="approval requests"
          />
        </SectionCard>

        {!viewer.is_owner && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-300">
            This page is restricted to the Inventory account owner.
          </div>
        )}
      </PageContainer>

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
        onConfirm={executeApprovalAction}
      />
    </AppLayout>
  );
}

/*
|--------------------------------------------------------------------------
| Approval table
|--------------------------------------------------------------------------
*/

type PurchaseApprovalTableProps = {
  purchaseOrders: PurchaseOrder[];
  expandedPurchaseOrderId: number | null;
  onToggleDetails: (purchaseOrderId: number) => void;
  onAction: (order: PurchaseOrder, action: ApprovalAction) => void;
};

function PurchaseApprovalTable({
  purchaseOrders,
  expandedPurchaseOrderId,
  onToggleDetails,
  onAction,
}: PurchaseApprovalTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-background/20">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1130px] border-collapse">
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
                className="min-w-[190px] px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
              >
                Supplier
              </th>

              <th
                scope="col"
                className="min-w-[205px] px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
              >
                Destination
              </th>

              <th
                scope="col"
                className="min-w-[180px] px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
              >
                Submitted By
              </th>

              <th
                scope="col"
                className="min-w-[150px] px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
              >
                Order Value
              </th>

              <th
                scope="col"
                className="w-[190px] px-3 py-2.5 text-right text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
              >
                Decision
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border/60">
            {purchaseOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-14">
                  <div className="mx-auto flex max-w-md flex-col items-center text-center">
                    <span className="flex size-12 items-center justify-center rounded-xl border border-emerald-500/15 bg-emerald-500/10 text-emerald-400">
                      <ShieldCheck className="size-5" />
                    </span>

                    <h3 className="mt-3 text-sm font-semibold">
                      No purchase orders awaiting approval
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Submitted orders from managers or authorized team members
                      will appear here for owner review.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              purchaseOrders.map((purchaseOrder) => {
                const isExpanded = expandedPurchaseOrderId === purchaseOrder.id;
                const detailsId = `purchase-approval-details-${purchaseOrder.id}`;
                const waitingDays = daysSince(purchaseOrder.submitted_at);

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
                        <EntityInfo
                          avatar={
                            <EntityAvatar
                              icon={ClipboardCheck}
                              className="border-primary/20 bg-primary/10 text-primary group-hover:border-primary/30 group-hover:bg-primary/15"
                            />
                          }
                          title={purchaseOrder.po_number}
                          badges={
                            <StatusBadge
                              label={purchaseOrder.status_label}
                              variant="warning"
                            />
                          }
                          subtitle={
                            <span>
                              Ordered {formatDate(purchaseOrder.order_date)}
                            </span>
                          }
                          description={`${formatNumber(purchaseOrder.items_count)} product${purchaseOrder.items_count === 1 ? "" : "s"} · ${formatQuantity(purchaseOrder.ordered_quantity)} units`}
                        />
                      </td>

                      <td className="px-3 py-3.5 align-middle">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <EntityAvatar
                            icon={Truck}
                            className="border-primary/20 bg-primary/10 text-primary"
                          />

                          <div className="min-w-0">
                            <p className="max-w-[155px] truncate text-[11px] font-semibold text-foreground/90">
                              {purchaseOrder.supplier.name}
                            </p>

                            <p className="mt-1 max-w-[160px] truncate text-[9px] text-muted-foreground">
                              {purchaseOrder.supplier.code ??
                                "No supplier code"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-3.5 align-middle">
                        <div className="space-y-1.5 text-[10px]">
                          <div className="flex min-w-0 items-center gap-2">
                            <Building2 className="size-3.5 shrink-0 text-primary" />
                            <span className="max-w-[165px] truncate font-medium text-foreground/85">
                              {purchaseOrder.branch.name}
                            </span>
                          </div>

                          <div className="flex min-w-0 items-center gap-2 text-muted-foreground">
                            <Warehouse className="size-3.5 shrink-0 text-primary" />
                            <span className="max-w-[165px] truncate">
                              {purchaseOrder.warehouse.name}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-3.5 align-middle">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <EntityAvatar
                            icon={UserRound}
                            className="border-primary/20 bg-primary/10 text-primary"
                          />

                          <div className="min-w-0">
                            <p className="max-w-[145px] truncate text-[11px] font-semibold text-foreground/90">
                              {purchaseOrder.submitted_by?.name ??
                                "Unknown user"}
                            </p>

                            <p className="mt-1 text-[9px] text-muted-foreground">
                              {formatDateTime(purchaseOrder.submitted_at)}
                            </p>

                            <p
                              className={cn(
                                "mt-1 text-[9px] font-medium",
                                waitingDays >= 3
                                  ? "text-red-400"
                                  : "text-amber-400",
                              )}
                            >
                              Waiting {formatWaitingTime(waitingDays)}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-3.5 align-middle">
                        <div className="space-y-1.5">
                          <p className="text-[13px] font-semibold tabular-nums text-primary">
                            {formatCurrency(purchaseOrder.total_amount)}
                          </p>

                          <p className="text-[9px] text-muted-foreground">
                            {purchaseOrder.payment_terms ?? "No payment terms"}
                          </p>
                        </div>
                      </td>

                      <td className="px-3 py-3.5 align-middle">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              onAction(purchaseOrder, "return-to-draft")
                            }
                            className="h-8 border-violet-500/15 bg-violet-500/[0.045] px-2.5 text-[10px] text-violet-300 hover:bg-violet-500/10 hover:text-violet-200"
                          >
                            <Undo2 className="size-3.5" />
                            Return
                          </Button>

                          <Button
                            type="button"
                            onClick={() => onAction(purchaseOrder, "approve")}
                            className="h-8 bg-emerald-600 px-2.5 text-[10px] text-white hover:bg-emerald-500"
                          >
                            <CheckCircle2 className="size-3.5" />
                            Approve
                          </Button>
                        </div>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr id={detailsId}>
                        <td
                          colSpan={7}
                          className="border-t border-primary/15 bg-primary/[0.02] p-0"
                        >
                          <PurchaseApprovalDetails order={purchaseOrder} />
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

/*
|--------------------------------------------------------------------------
| Expanded approval details
|--------------------------------------------------------------------------
*/

function PurchaseApprovalDetails({ order }: { order: PurchaseOrder }) {
  return (
    <div className="grid gap-4 p-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.8fr)]">
      <div className="min-w-0 space-y-4">
        <section className="overflow-hidden rounded-xl border border-border/70 bg-card/35">
          <div className="flex flex-col gap-2 border-b border-border/60 bg-muted/15 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h4 className="text-xs font-semibold">Requested Products</h4>
              <p className="mt-0.5 text-[9px] text-muted-foreground">
                Product snapshots and agreed supplier costs submitted for
                approval.
              </p>
            </div>

            <Badge
              variant="outline"
              className="h-6 w-fit rounded-full border-violet-500/15 bg-violet-500/[0.06] px-2.5 text-[9px] text-violet-300"
            >
              <Boxes className="mr-1 size-3" />
              {formatNumber(order.items.length)} line
              {order.items.length === 1 ? "" : "s"}
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead className="border-b border-border/60 bg-muted/10">
                <tr className="text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Product</th>
                  <th className="w-32 px-4 py-2.5 text-right font-medium">
                    Quantity
                  </th>
                  <th className="w-36 px-4 py-2.5 text-right font-medium">
                    Unit Cost
                  </th>
                  <th className="w-36 px-4 py-2.5 text-right font-medium">
                    Line Total
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border/50">
                {order.items.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/[0.025]">
                    <td className="px-4 py-3">
                      <div className="flex min-w-0 items-start gap-2.5">
                        <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                          <Boxes className="size-3.5" />
                        </span>

                        <div className="min-w-0">
                          <p className="truncate text-[11px] font-semibold text-foreground/90">
                            {item.product_name}
                          </p>

                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <Badge
                              variant="outline"
                              className="h-5 rounded-md border-violet-500/15 bg-violet-500/[0.045] px-1.5 font-mono text-[8px] text-violet-300"
                            >
                              <Hash className="mr-0.5 size-2.5" />
                              {item.product_sku ?? "NO SKU"}
                            </Badge>

                            {item.notes && (
                              <span className="max-w-[290px] truncate text-[8px] text-muted-foreground">
                                {item.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right text-[11px] font-medium tabular-nums">
                      {formatQuantity(item.quantity)} {item.unit}
                    </td>

                    <td className="px-4 py-3 text-right text-[11px] tabular-nums text-muted-foreground">
                      {formatCurrency(item.unit_cost)}
                    </td>

                    <td className="px-4 py-3 text-right text-[11px] font-semibold tabular-nums text-primary">
                      {formatCurrency(item.line_total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          <DetailCard title="Delivery Schedule" icon={CalendarDays} tone="blue">
            <DetailLine
              label="Order date"
              value={formatDate(order.order_date)}
            />
            <DetailLine
              label="Expected delivery"
              value={formatDate(order.expected_delivery_date)}
            />
            <DetailLine
              label="Receiving branch"
              value={`${order.branch.name}${order.branch.code ? ` (${order.branch.code})` : ""}`}
            />
            <DetailLine
              label="Receiving warehouse"
              value={`${order.warehouse.name}${order.warehouse.code ? ` (${order.warehouse.code})` : ""}`}
            />
          </DetailCard>

          <DetailCard title="Submission Trail" icon={UserRound} tone="violet">
            <DetailLine
              label="Created by"
              value={order.created_by?.name ?? "Not recorded"}
            />
            <DetailLine
              label="Submitted by"
              value={order.submitted_by?.name ?? "Not recorded"}
            />
            <DetailLine
              label="Submitted at"
              value={formatDateTime(order.submitted_at)}
            />
            <DetailLine label="Current state" value="Awaiting owner approval" />
          </DetailCard>
        </div>

        {order.notes && (
          <section className="rounded-xl border border-primary/15 bg-primary/[0.05] p-4">
            <div className="flex items-start gap-3">
              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                <FileText className="size-4" />
              </span>

              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-primary">
                  Order Notes
                </p>
                <p className="mt-2 whitespace-pre-wrap text-[11px] leading-5 text-muted-foreground">
                  {order.notes}
                </p>
              </div>
            </div>
          </section>
        )}
      </div>

      <div className="space-y-4">
        <section className="overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/[0.07] via-card to-card">
          <div className="flex items-center gap-3 border-b border-primary/15 px-4 py-3">
            <span className="inline-flex size-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
              <Banknote className="size-4" />
            </span>

            <div>
              <h4 className="text-xs font-semibold">Financial Review</h4>
              <p className="mt-0.5 text-[9px] text-muted-foreground">
                Supplier commitment before approval
              </p>
            </div>
          </div>

          <div className="space-y-3 p-4">
            <SummaryRow
              label="Subtotal"
              value={formatCurrency(order.subtotal)}
            />
            <SummaryRow
              label="Discount"
              value={formatCurrency(order.discount_amount)}
            />
            <SummaryRow label="Tax" value={formatCurrency(order.tax_amount)} />
            <SummaryRow
              label="Shipping"
              value={formatCurrency(order.shipping_amount)}
            />

            <div className="border-t border-primary/15 pt-3">
              <SummaryRow
                label="Order Total"
                value={formatCurrency(order.total_amount)}
                strong
              />
            </div>

            <div className="rounded-lg border border-border/60 bg-background/30 px-3 py-2.5">
              <p className="text-[8px] uppercase tracking-[0.08em] text-muted-foreground">
                Payment terms
              </p>
              <p className="mt-1 text-[11px] font-semibold text-foreground/85">
                {order.payment_terms ?? "Not specified"}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-amber-500/15 bg-amber-500/[0.035] p-4">
          <div className="flex items-start gap-3">
            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-amber-500/15 bg-amber-500/10 text-amber-400">
              <ShieldCheck className="size-4" />
            </span>

            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-amber-300">
                Approval Effect
              </p>
              <p className="mt-2 text-[10px] leading-5 text-muted-foreground">
                Approving this request changes the purchase order to Approved
                and makes it available in Receiving. Returning it moves the
                request back to Draft so the submitter can correct and resubmit
                it.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Small visual components
|--------------------------------------------------------------------------
*/

type ApprovalMetricProps = {
  title: string;
  value: ReactNode;
  description: string;
  footerLabel: string;
  footerValue: string;
  icon: LucideIcon;
  tone: "amber" | "emerald" | "blue" | "violet" | "red";
  className?: string;
};

function ApprovalMetric({
  title,
  value,
  description,
  footerLabel,
  footerValue,
  icon: Icon,
  tone,
  className,
}: ApprovalMetricProps) {
  const tones = {
    amber: {
      icon: "border-amber-500/15 bg-amber-500/10 text-amber-400",
      value: "text-amber-400",
      bar: "bg-amber-400",
    },
    emerald: {
      icon: "border-primary/20 bg-primary/10 text-primary",
      value: "text-primary",
      bar: "bg-primary",
    },
    blue: {
      icon: "border-primary/20 bg-primary/10 text-primary",
      value: "text-primary",
      bar: "bg-primary",
    },
    violet: {
      icon: "border-primary/20 bg-primary/10 text-primary",
      value: "text-primary",
      bar: "bg-primary",
    },
    red: {
      icon: "border-red-500/15 bg-red-500/10 text-red-400",
      value: "text-red-400",
      bar: "bg-red-400",
    },
  } as const;

  const selectedTone = tones[tone];

  return (
    <div className={cn("min-w-0 p-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[9px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">
            {title}
          </p>
          <p
            className={cn(
              "mt-2 truncate text-xl font-semibold leading-none tracking-[-0.03em] tabular-nums",
              selectedTone.value,
            )}
          >
            {value}
          </p>
        </div>

        <span
          className={cn(
            "inline-flex size-8 shrink-0 items-center justify-center rounded-lg border",
            selectedTone.icon,
          )}
        >
          <Icon className="size-4" />
        </span>
      </div>

      <p className="mt-2 truncate text-[9px] text-muted-foreground">
        {description}
      </p>

      <div className="mt-3 h-px bg-border/60" />

      <div className="mt-2 flex items-center justify-between gap-3 text-[8px] uppercase tracking-[0.07em] text-muted-foreground">
        <span className="truncate">{footerLabel}</span>
        <span className={cn("shrink-0 font-semibold", selectedTone.value)}>
          {footerValue}
        </span>
      </div>

      <div className="mt-2 h-1 overflow-hidden rounded-full bg-background/60">
        <div className={cn("h-full w-2/3 rounded-full", selectedTone.bar)} />
      </div>
    </div>
  );
}

type DetailCardProps = {
  title: string;
  icon: LucideIcon;
  tone: "blue" | "violet";
  children: ReactNode;
};

function DetailCard({ title, icon: Icon, children }: DetailCardProps) {
  const toneClass =
    "border-primary/20 bg-primary/10 text-primary";

  return (
    <section className="rounded-xl border border-border/70 bg-card/35 p-4">
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            "inline-flex size-8 items-center justify-center rounded-lg border",
            toneClass,
          )}
        >
          <Icon className="size-4" />
        </span>
        <h4 className="text-xs font-semibold">{title}</h4>
      </div>

      <div className="mt-4 space-y-2.5">{children}</div>
    </section>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-[10px]">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 break-words text-right font-medium text-foreground/80">
        {value}
      </span>
    </div>
  );
}

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
        className={cn(
          "text-[10px] text-muted-foreground",
          strong && "font-semibold text-foreground/85",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "text-[11px] font-medium tabular-nums text-foreground/80",
          strong && "text-sm font-semibold text-primary",
        )}
      >
        {value}
      </span>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Approval confirmation content
|--------------------------------------------------------------------------
*/

function getApprovalActionDialog(target: ApprovalActionTarget | null): {
  title: string;
  description: string;
  confirmText: string;
  destructive: boolean;
} {
  if (!target) {
    return {
      title: "Review Purchase Order",
      description: "Confirm the selected approval action.",
      confirmText: "Continue",
      destructive: false,
    };
  }

  const number = target.order.po_number;

  if (target.action === "approve") {
    return {
      title: "Approve Purchase Order",
      description: `Approve ${number} for ${formatCurrency(target.order.total_amount)}? The order will become available in Receiving.`,
      confirmText: "Approve Order",
      destructive: false,
    };
  }

  return {
    title: "Return Purchase Order to Draft",
    description: `Return ${number} to Draft? Its submission record will be cleared so the requester can edit and submit it again.`,
    confirmText: "Return to Draft",
    destructive: true,
  };
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

function formatQuantity(value: number | string | null): string {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(Number.isFinite(amount) ? amount : 0);
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

function formatDate(value: string | null): string {
  if (!value) {
    return "Not set";
  }

  const date = new Date(`${value.slice(0, 10)}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return "Not recorded";
  }

  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function daysSince(value: string | null): number {
  if (!value) {
    return 0;
  }

  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return 0;
  }

  const difference = Date.now() - date.getTime();

  if (difference <= 0) {
    return 0;
  }

  return Math.floor(difference / 86_400_000);
}

function formatWaitingTime(days: number): string {
  if (days <= 0) {
    return "today";
  }

  if (days === 1) {
    return "1 day";
  }

  return `${formatNumber(days)} days`;
}