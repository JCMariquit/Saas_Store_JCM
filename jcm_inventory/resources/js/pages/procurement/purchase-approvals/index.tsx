import { AppDrawer } from "@/components/shared/app-drawer";
import { AppPagination } from "@/components/shared/app-pagination";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EntityAvatar } from "@/components/shared/entity-avatar";
import { FilterBar } from "@/components/shared/filter-bar";
import { IconInput } from "@/components/shared/icon-input";
import { PageContainer } from "@/components/shared/page-container";
import { SearchInput } from "@/components/shared/search-input";
import { SectionCard } from "@/components/shared/section-card";
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
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  FileText,
  RotateCcw,
  ShieldCheck,
  Truck,
  Undo2,
  UserRound,
  Warehouse,
  type LucideIcon,
} from "lucide-react";
import {
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

type ApprovalDrawerView = "all" | "value" | "today" | "oldest";

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
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] =
    useState<PurchaseOrder | null>(null);

  const [approvalDrawerView, setApprovalDrawerView] =
    useState<ApprovalDrawerView | null>(null);

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

  function openApprovalDetails(order: PurchaseOrder): void {
    setSelectedPurchaseOrder(order);
  }

  function closeApprovalDetails(): void {
    setSelectedPurchaseOrder(null);
  }

  function openApprovalDrawer(view: ApprovalDrawerView): void {
    setApprovalDrawerView(view);
  }

  function closeApprovalDrawer(): void {
    setApprovalDrawerView(null);
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
          setSelectedPurchaseOrder(null);
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
            <button
              type="button"
              onClick={() => openApprovalDrawer("value")}
              className="relative overflow-hidden border-b border-border/60 p-4 text-left transition-colors hover:bg-primary/[0.025] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/35 lg:border-b-0 lg:border-r"
            >
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
            </button>

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
                onClick={() => openApprovalDrawer("all")}
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
                onClick={() => openApprovalDrawer("value")}
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
                onClick={() => openApprovalDrawer("today")}
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
                onClick={() => openApprovalDrawer("oldest")}
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
            onSelect={openApprovalDetails}
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

      <ApprovalOverviewDrawer
        view={approvalDrawerView}
        pagination={purchase_orders}
        summary={summary}
        onClose={closeApprovalDrawer}
        onSelect={(order) => {
          closeApprovalDrawer();
          openApprovalDetails(order);
        }}
      />

      <ApprovalDetailsDrawer
        order={selectedPurchaseOrder}
        onClose={closeApprovalDetails}
        onAction={(order, action) => {
          closeApprovalDetails();
          requestApprovalAction(order, action);
        }}
      />

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
  onSelect: (order: PurchaseOrder) => void;
};

function PurchaseApprovalTable({
  purchaseOrders,
  onSelect,
}: PurchaseApprovalTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-background/20 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] border-collapse table-fixed">
          <thead className="border-b border-primary/10 bg-primary/[0.025]">
            <tr>
              <th className="w-[220px] px-4 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Purchase Order
              </th>
              <th className="w-[220px] px-4 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Supplier
              </th>
              <th className="w-[220px] px-4 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Destination
              </th>
              <th className="w-[210px] px-4 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Submitted
              </th>
              <th className="w-[180px] px-4 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Commitment
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border/60">
            {purchaseOrders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-14 text-center">
                  <ShieldCheck className="mx-auto size-7 text-muted-foreground" />
                  <h3 className="mt-3 text-sm font-semibold">
                    No purchase orders awaiting approval
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Submitted orders will appear here for owner review.
                  </p>
                </td>
              </tr>
            ) : (
              purchaseOrders.map((order) => {
                const waitingDays = daysSince(order.submitted_at);

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
                      <div className="flex items-center gap-3">
                        <EntityAvatar
                          icon={ClipboardCheck}
                          className="border-primary/15 bg-primary/[0.07] text-primary"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-mono text-[10px] font-semibold text-primary">
                            {order.po_number}
                          </p>
                          <p className="mt-1 text-[8px] text-muted-foreground">
                            {order.items_count} product{order.items_count === 1 ? "" : "s"} · {formatQuantity(order.ordered_quantity)} units
                          </p>
                        </div>
                      </div>
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
                      <p className="truncate text-[10px] font-semibold">
                        {order.submitted_by?.name ?? "Unknown user"}
                      </p>
                      <p className="mt-1 text-[8px] text-muted-foreground">
                        {formatDateTime(order.submitted_at)}
                      </p>
                      <p
                        className={cn(
                          "mt-1 text-[8px] font-semibold",
                          waitingDays >= 3 ? "text-red-400" : "text-amber-400",
                        )}
                      >
                        Waiting {formatWaitingTime(waitingDays)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-[12px] font-semibold tabular-nums text-primary">
                            {formatCurrency(order.total_amount)}
                          </p>
                          <p className="mt-1 text-[8px] text-muted-foreground">
                            {order.payment_terms ?? "No payment terms"}
                          </p>
                        </div>
                        <ChevronRight className="size-4 shrink-0 text-muted-foreground group-hover:text-primary" />
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

function ApprovalOverviewDrawer({
  view,
  pagination,
  summary,
  onClose,
  onSelect,
}: {
  view: ApprovalDrawerView | null;
  pagination: PaginatedPurchaseOrders;
  summary: ApprovalSummary;
  onClose: () => void;
  onSelect: (order: PurchaseOrder) => void;
}) {
  const activeView = view ?? "all";
  const today = new Date().toISOString().slice(0, 10);

  const configs = {
    all: {
      title: "Approval Queue",
      value: formatNumber(summary.pending_orders),
      description: "Submitted purchase orders awaiting owner review.",
    },
    value: {
      title: "Pending Commitment",
      value: formatCurrency(summary.pending_value),
      description: "Unapproved supplier value represented by the queue.",
    },
    today: {
      title: "Submitted Today",
      value: formatNumber(summary.submitted_today),
      description: "New requests submitted during the current day.",
    },
    oldest: {
      title: "Oldest Approval Requests",
      value: summary.oldest_submitted_at
        ? formatDateTime(summary.oldest_submitted_at)
        : "—",
      description: "Queue records ordered by waiting priority.",
    },
  }[activeView];

  const visibleOrders = pagination.data
    .filter((order) => {
      if (activeView !== "today") return true;
      return Boolean(order.submitted_at?.slice(0, 10) === today);
    })
    .sort((a, b) => {
      if (activeView !== "oldest") return 0;
      return (
        new Date(a.submitted_at ?? 0).getTime() -
        new Date(b.submitted_at ?? 0).getTime()
      );
    });

  return (
    <AppDrawer
      open={view !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={configs.title}
      description={configs.description}
      processing={false}
    >
      <div className="flex min-h-full flex-col bg-card">
        <div className="border-b border-primary/10 bg-gradient-to-br from-primary/[0.055] via-primary/[0.012] to-transparent px-5 py-5">
          <p className="text-2xl font-semibold leading-none tabular-nums text-primary">
            {configs.value}
          </p>
          <p className="mt-1 text-[9px] text-muted-foreground">
            Approval queue summary
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {visibleOrders.length === 0 ? (
            <div className="flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-background/20 p-6 text-center">
              <ShieldCheck className="size-6 text-muted-foreground" />
              <p className="mt-3 text-sm font-semibold">No loaded matches</p>
            </div>
          ) : (
            <div className="space-y-2">
              {visibleOrders.map((order) => (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => onSelect(order)}
                  className="flex w-full items-center gap-3 rounded-xl border border-border/60 bg-background/25 p-3 text-left transition hover:border-primary/20 hover:bg-primary/[0.035]"
                >
                  <EntityAvatar
                    icon={ClipboardCheck}
                    className="border-primary/15 bg-primary/[0.07] text-primary"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[10px] font-semibold text-primary">
                      {order.po_number}
                    </p>
                    <p className="mt-1 truncate text-[9px] text-muted-foreground">
                      {order.supplier.name} · {formatCurrency(order.total_amount)}
                    </p>
                    <p className="mt-1 text-[8px] text-amber-400">
                      Waiting {formatWaitingTime(daysSince(order.submitted_at))}
                    </p>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppDrawer>
  );
}

function ApprovalDetailsDrawer({
  order,
  onClose,
  onAction,
}: {
  order: PurchaseOrder | null;
  onClose: () => void;
  onAction: (order: PurchaseOrder, action: ApprovalAction) => void;
}) {
  return (
    <AppDrawer
      open={order !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title="Purchase Approval Review"
      description="Review requested products, supplier commitment, totals, destination, and submitter before deciding."
      processing={false}
    >
      {order && (
        <div className="flex min-h-full flex-col bg-card">
          <div className="min-h-0 flex-1 overflow-y-auto">
            <PurchaseApprovalDetails order={order} />
          </div>
          <div className="grid gap-2 border-t border-border/60 bg-background/30 p-4 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onAction(order, "return-to-draft")}
              className="h-10 border-violet-500/20 text-violet-300 hover:bg-violet-500/10"
            >
              <Undo2 className="size-4" />
              Return to Draft
            </Button>
            <Button
              type="button"
              onClick={() => onAction(order, "approve")}
              className="h-10 bg-emerald-600 text-white hover:bg-emerald-500"
            >
              <CheckCircle2 className="size-4" />
              Approve Order
            </Button>
          </div>
        </div>
      )}
    </AppDrawer>
  );
}

function PurchaseApprovalDetails({ order }: { order: PurchaseOrder }) {
  const waitingDays = daysSince(order.submitted_at);

  return (
    <div className="space-y-4 p-4">
      <section className="overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.065] via-card/95 to-card shadow-sm">
        <div className="border-b border-primary/10 bg-background/20 px-4 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/[0.08] text-amber-400">
                <ClipboardCheck className="size-4.5" />
              </span>
              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-amber-400">
                  Awaiting owner decision
                </p>
                <h2 className="mt-1 break-words font-mono text-sm font-semibold text-foreground">
                  {order.po_number}
                </h2>
                <p className="mt-1 break-words text-[10px] leading-5 text-muted-foreground">
                  {order.supplier.name} · Submitted by {order.submitted_by?.name ?? "Unknown user"}
                </p>
              </div>
            </div>

            <Badge
              variant="outline"
              className="h-7 w-fit shrink-0 rounded-full border-amber-500/20 bg-amber-500/[0.07] px-2.5 text-[9px] font-semibold text-amber-300"
            >
              Waiting {formatWaitingTime(waitingDays)}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-y divide-border/60 sm:grid-cols-4 sm:divide-y-0">
          <ApprovalHeroMetric
            label="Order total"
            value={formatCurrency(order.total_amount)}
            helper="Supplier commitment"
            valueClassName="text-primary"
          />
          <ApprovalHeroMetric
            label="Products"
            value={formatNumber(order.items.length)}
            helper="Submitted line items"
          />
          <ApprovalHeroMetric
            label="Quantity"
            value={formatQuantity(order.ordered_quantity)}
            helper="Total requested units"
          />
          <ApprovalHeroMetric
            label="Expected"
            value={formatDate(order.expected_delivery_date)}
            helper="Requested delivery"
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-border/70 bg-background/25">
        <div className="flex items-center justify-between gap-3 border-b border-border/60 bg-background/20 px-4 py-3">
          <div>
            <h3 className="text-[11px] font-semibold">Requested Products</h3>
            <p className="mt-0.5 text-[9px] text-muted-foreground">
              Product quantities and supplier costs submitted for approval.
            </p>
          </div>
          <Badge
            variant="outline"
            className="h-6 rounded-full border-violet-500/15 bg-violet-500/[0.06] px-2.5 text-[9px] text-violet-300"
          >
            <Boxes className="mr-1 size-3" />
            {formatNumber(order.items.length)} line
            {order.items.length === 1 ? "" : "s"}
          </Badge>
        </div>

        <div className="divide-y divide-border/60">
          {order.items.map((item) => (
            <article key={item.id} className="p-4">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/[0.07] text-primary">
                  <Boxes className="size-4" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="break-words text-[11px] font-semibold text-foreground">
                        {item.product_name}
                      </p>
                      <p className="mt-1 font-mono text-[8px] text-muted-foreground">
                        {item.product_sku ?? "NO SKU"} · Unit: {item.unit}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold tabular-nums text-primary">
                      {formatCurrency(item.line_total)}
                    </p>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    <ApprovalLineMetric
                      label="Quantity"
                      value={`${formatQuantity(item.quantity)} ${item.unit}`}
                    />
                    <ApprovalLineMetric
                      label="Unit cost"
                      value={formatCurrency(item.unit_cost)}
                    />
                    <ApprovalLineMetric
                      label="Line total"
                      value={formatCurrency(item.line_total)}
                      valueClassName="text-primary"
                    />
                  </div>

                  {item.notes && (
                    <p className="mt-3 whitespace-pre-wrap break-words rounded-lg border border-border/50 bg-background/30 px-3 py-2 text-[9px] leading-4 text-muted-foreground">
                      {item.notes}
                    </p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(250px,1fr))]">
        <ApprovalContextCard
          title="Supplier & Terms"
          description="Commercial context for this purchase request."
          icon={Truck}
          tone="blue"
        >
          <ApprovalDetailRow label="Supplier" value={order.supplier.name} />
          <ApprovalDetailRow
            label="Contact"
            value={order.supplier.contact_person ?? "Not provided"}
          />
          <ApprovalDetailRow
            label="Payment terms"
            value={order.payment_terms ?? "Not specified"}
          />
        </ApprovalContextCard>

        <ApprovalContextCard
          title="Delivery Destination"
          description="Where the approved goods will be received."
          icon={Warehouse}
          tone="violet"
        >
          <ApprovalDetailRow
            label="Branch"
            value={`${order.branch.name}${order.branch.code ? ` · ${order.branch.code}` : ""}`}
          />
          <ApprovalDetailRow
            label="Warehouse"
            value={`${order.warehouse.name}${order.warehouse.code ? ` · ${order.warehouse.code}` : ""}`}
          />
          <ApprovalDetailRow
            label="Order date"
            value={formatDate(order.order_date)}
          />
          <ApprovalDetailRow
            label="Expected"
            value={formatDate(order.expected_delivery_date)}
          />
        </ApprovalContextCard>

        <ApprovalContextCard
          title="Submission Trail"
          description="Who prepared and submitted the request."
          icon={UserRound}
          tone="violet"
        >
          <ApprovalDetailRow
            label="Created by"
            value={order.created_by?.name ?? "Not recorded"}
          />
          <ApprovalDetailRow
            label="Submitted by"
            value={order.submitted_by?.name ?? "Not recorded"}
          />
          <ApprovalDetailRow
            label="Submitted at"
            value={formatDateTime(order.submitted_at)}
          />
          <ApprovalDetailRow
            label="Current state"
            value="Awaiting owner approval"
          />
        </ApprovalContextCard>
      </div>

      <section className="overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.065] via-card to-card">
        <div className="flex items-center gap-3 border-b border-primary/15 px-4 py-3">
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
            <Banknote className="size-4" />
          </span>
          <div>
            <h3 className="text-[11px] font-semibold">Financial Review</h3>
            <p className="mt-0.5 text-[9px] text-muted-foreground">
              Confirm the complete supplier commitment before approval.
            </p>
          </div>
        </div>

        <div className="p-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <ApprovalFinancialRow
              label="Subtotal"
              value={formatCurrency(order.subtotal)}
            />
            <ApprovalFinancialRow
              label="Discount"
              value={formatCurrency(order.discount_amount)}
            />
            <ApprovalFinancialRow
              label="Tax"
              value={formatCurrency(order.tax_amount)}
            />
            <ApprovalFinancialRow
              label="Shipping"
              value={formatCurrency(order.shipping_amount)}
            />
          </div>

          <div className="mt-3 flex flex-col gap-2 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.045] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Order total
              </p>
              <p className="mt-1 text-[9px] text-muted-foreground">
                Payment terms: {order.payment_terms ?? "Not specified"}
              </p>
            </div>
            <p className="text-xl font-semibold tabular-nums text-primary">
              {formatCurrency(order.total_amount)}
            </p>
          </div>
        </div>
      </section>

      {order.notes && (
        <section className="rounded-2xl border border-primary/15 bg-primary/[0.035] p-4">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
              <FileText className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-primary">
                Order notes
              </p>
              <p className="mt-2 whitespace-pre-wrap break-words text-[10px] leading-5 text-muted-foreground">
                {order.notes}
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-amber-500/15 bg-amber-500/[0.035] p-4">
        <div className="flex items-start gap-3">
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-amber-500/15 bg-amber-500/10 text-amber-400">
            <ShieldCheck className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-amber-300">
              Approval effect
            </p>
            <p className="mt-2 text-[10px] leading-5 text-muted-foreground">
              Approving makes this order available for Receiving. Returning it to
              Draft allows the submitter to correct the request and resubmit it.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function ApprovalHeroMetric({
  label,
  value,
  helper,
  valueClassName,
}: {
  label: string;
  value: string;
  helper: string;
  valueClassName?: string;
}) {
  return (
    <div className="min-w-0 p-3.5">
      <p className="text-[8px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-1.5 break-words text-[12px] font-semibold tabular-nums text-foreground",
          valueClassName,
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-[8px] leading-4 text-muted-foreground">
        {helper}
      </p>
    </div>
  );
}

function ApprovalLineMetric({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-lg border border-border/50 bg-background/30 px-2.5 py-2">
      <p className="text-[7px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 break-words text-[10px] font-semibold tabular-nums text-foreground",
          valueClassName,
        )}
      >
        {value}
      </p>
    </div>
  );
}

function ApprovalContextCard({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  tone: "blue" | "violet";
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border/70 bg-background/25">
      <div className="flex items-start gap-3 border-b border-border/60 bg-background/20 px-4 py-3">
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <h3 className="text-[11px] font-semibold">{title}</h3>
          <p className="mt-0.5 text-[8px] leading-4 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      <div className="divide-y divide-border/50 px-4">{children}</div>
    </section>
  );
}

function ApprovalDetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="grid grid-cols-[minmax(105px,0.42fr)_minmax(0,0.58fr)] gap-3 py-2.5">
      <span className="text-[8px] font-medium uppercase tracking-[0.09em] text-muted-foreground">
        {label}
      </span>
      <span className="min-w-0 break-words text-right text-[10px] font-medium leading-4 text-foreground/85">
        {value}
      </span>
    </div>
  );
}

function ApprovalFinancialRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border/50 bg-background/25 px-3 py-2.5">
      <span className="text-[9px] text-muted-foreground">{label}</span>
      <span className="break-words text-right text-[10px] font-semibold tabular-nums text-foreground">
        {value}
      </span>
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
  onClick: () => void;
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
  onClick,
  className,
}: ApprovalMetricProps) {
  const tones = {
    amber: {
      icon: "border-amber-500/15 bg-amber-500/10 text-amber-400",
      value: "text-amber-400",
      bar: "bg-amber-400",
    },
    emerald: {
      icon: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
      value: "text-emerald-400",
      bar: "bg-emerald-400",
    },
    blue: {
      icon: "border-primary/20 bg-primary/10 text-primary",
      value: "text-primary",
      bar: "bg-primary",
    },
    violet: {
      icon: "border-violet-500/20 bg-violet-500/10 text-violet-300",
      value: "text-violet-300",
      bar: "bg-violet-400",
    },
    red: {
      icon: "border-red-500/15 bg-red-500/10 text-red-400",
      value: "text-red-400",
      bar: "bg-red-400",
    },
  } as const;

  const selectedTone = tones[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group min-w-0 p-4 text-left transition-colors hover:bg-primary/[0.025] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/35",
        className,
      )}
    >
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
            "inline-flex size-8 shrink-0 items-center justify-center rounded-lg border transition-transform group-hover:scale-105",
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
    </button>
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