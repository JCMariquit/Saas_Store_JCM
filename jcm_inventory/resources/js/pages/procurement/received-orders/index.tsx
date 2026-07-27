import { AppDrawer } from "@/components/shared/app-drawer";
import { AppPagination } from "@/components/shared/app-pagination";
import { EntityAvatar } from "@/components/shared/entity-avatar";
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
  Banknote,
  Boxes,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  FileText,
  History,
  PackageCheck,
  ReceiptText,
  RotateCcw,
  ShieldCheck,
  Truck,
  UserRound,
  Warehouse,
  type LucideIcon,
} from "lucide-react";
import {
  type FormEvent,
  useEffect,
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
  code: string | null;
  name: string;
};

type WarehouseOption = {
  id: number;
  branch_id: number;
  code: string;
  name: string;
  is_main: boolean;
};

type ReceivedOrderItem = {
  id: number;
  product_id: number;
  product_name: string;
  product_sku: string | null;
  unit: string;
  ordered_quantity: number;
  received_quantity: number;
  unit_cost: number;
  line_total: number;
  notes: string | null;
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

type ReceiptRecord = {
  id: number;
  receipt_number: string;
  delivery_reference: string | null;
  received_date: string;
  status: "posted" | "voided";
  status_label: string;
  total_quantity: number;
  total_amount: number;
  notes: string | null;
  posted_at: string | null;
  voided_at: string | null;
  void_reason: string | null;
  received_by: UserReference | null;
  voided_by: UserReference | null;
  items: ReceiptItem[];
};

type ReceivedOrder = {
  id: number;
  po_number: string;
  order_date: string;
  expected_delivery_date: string | null;
  status: "received";
  status_label: string;
  payment_terms: string | null;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  shipping_amount: number;
  total_amount: number;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  submitted_at: string | null;
  approved_at: string | null;
  first_received_date: string | null;
  completed_date: string | null;
  completed_at: string | null;
  receipt_count: number;
  item_count: number;
  ordered_quantity: number;
  received_quantity: number;
  received_value: number;
  supplier: {
    id: number;
    name: string;
    code: string | null;
    contact_person: string | null;
    phone: string | null;
    email: string | null;
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
  created_by: UserReference | null;
  submitted_by: UserReference | null;
  approved_by: UserReference | null;
  items: ReceivedOrderItem[];
  receipts: ReceiptRecord[];
};

type PaginationLink = {
  url: string | null;
  label: string;
  active: boolean;
};

type PaginatedReceivedOrders = {
  current_page: number;
  data: ReceivedOrder[];
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

type ReceivedOrderSummary = {
  total_orders: number;
  total_receipts: number;
  received_quantity: number;
  received_value: number;
  completed_this_month: number;
};

type ReceivedOrderFilters = {
  search: string;
  supplier_id: string;
  warehouse_id: string;
  date_from: string;
  date_to: string;
};

type ReceivedOrderViewer = {
  user_id: number;
  account_owner_id: number;
  role_code: string;
  role_name: string;
  is_owner: boolean;
};

type ReceivedOrderDrawerView = "all" | "receipts" | "month" | "value";

type ReceivedOrderPageProps = {
  received_orders: PaginatedReceivedOrders;
  summary: ReceivedOrderSummary;
  suppliers: SupplierOption[];
  warehouses: WarehouseOption[];
  filters: ReceivedOrderFilters;
  viewer: ReceivedOrderViewer;
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
    title: "Procurement",
    href: "/suppliers",
  },
  {
    title: "Received Orders",
    href: "/procurement/received-orders",
  },
];

const ALL_VALUE = "all";

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function ReceivedOrderIndex({
  received_orders,
  summary,
  suppliers,
  warehouses,
  filters,
  viewer,
}: ReceivedOrderPageProps) {
  const [selectedOrder, setSelectedOrder] = useState<ReceivedOrder | null>(
    null,
  );

  const [archiveDrawerView, setArchiveDrawerView] =
    useState<ReceivedOrderDrawerView | null>(null);
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

  function applyFilters(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    router.get(
      "/procurement/received-orders",
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
      "/procurement/received-orders",
      {},
      {
        preserveState: true,
        preserveScroll: true,
        replace: true,
      },
    );
  }

  function openOrderDetails(order: ReceivedOrder): void {
    setSelectedOrder(order);
  }

  function closeOrderDetails(): void {
    setSelectedOrder(null);
  }

  function openArchiveDrawer(view: ReceivedOrderDrawerView): void {
    setArchiveDrawerView(view);
  }

  function closeArchiveDrawer(): void {
    setArchiveDrawerView(null);
  }

  const hasActiveFilters = Boolean(
    search.trim() || supplierId || warehouseId || dateFrom || dateTo,
  );

  const monthlyShare =
    summary.total_orders > 0
      ? Math.round((summary.completed_this_month / summary.total_orders) * 100)
      : 0;

  const averageReceipts =
    summary.total_orders > 0
      ? summary.total_receipts / summary.total_orders
      : 0;

  const averageQuantity =
    summary.total_orders > 0
      ? summary.received_quantity / summary.total_orders
      : 0;

  const averageValue =
    summary.total_orders > 0
      ? summary.received_value / summary.total_orders
      : 0;

  const archiveLabel =
    summary.total_orders === 0
      ? "No completed orders"
      : summary.completed_this_month > 0
        ? `${formatNumber(summary.completed_this_month)} completed this month`
        : "Received archive is up to date";

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Received Orders" />

      <PageContainer className="gap-4 md:gap-5">
        <section className="min-w-0 overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.07] via-card/70 to-card/40">
          <div className="flex flex-col gap-3 border-b border-border/60 bg-background/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                <History className="size-4" />
              </span>

              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-foreground">
                  Received Order Archive
                </p>

                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  Completed supplier orders, receipt records, warehouse intake,
                  received products, and final order value.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="h-6 rounded-full border-border/70 bg-muted/20 px-2.5 text-[9px] font-medium text-muted-foreground"
              >
                <ShieldCheck className="mr-1 size-3" />
                Read only · {viewer.role_name}
              </Badge>

              <Badge
                variant="outline"
                className={cn(
                  "h-6 rounded-full px-2.5 text-[9px] font-semibold",
                  summary.total_orders === 0
                    ? "border-slate-500/20 bg-slate-500/10 text-slate-300"
                    : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
                )}
              >
                <PackageCheck className="mr-1 size-3" />
                {archiveLabel}
              </Badge>
            </div>
          </div>

          <div className="grid min-w-0 lg:grid-cols-[minmax(330px,1.08fr)_minmax(0,1.92fr)]">
            <button
              type="button"
              onClick={() => openArchiveDrawer("all")}
              className="relative overflow-hidden border-b border-border/60 p-4 text-left transition-colors hover:bg-primary/[0.025] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/35 lg:border-b-0 lg:border-r"
            >
              <div className="pointer-events-none absolute -right-14 -top-16 size-44 rounded-full bg-primary/10 blur-3xl" />
              <History className="pointer-events-none absolute -bottom-8 -right-5 size-28 text-primary opacity-[0.025]" />

              <div className="relative grid gap-4 sm:grid-cols-[64px_minmax(0,1fr)] sm:items-center">
                <div className="flex size-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                  <PackageCheck className="size-7" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-primary">
                        Completed procurement orders
                      </p>

                      <p className="mt-2 text-[27px] font-semibold leading-none tracking-[-0.04em]">
                        {formatNumber(summary.total_orders)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-semibold tabular-nums text-primary">
                        {formatNumber(summary.completed_this_month)}
                      </p>

                      <p className="mt-1 text-[8px] uppercase tracking-wider text-muted-foreground">
                        This month
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-background/60">
                    <div
                      className="h-full rounded-full bg-primary transition-[width] duration-500"
                      style={{
                        width: `${Math.max(
                          summary.completed_this_month > 0 ? 4 : 0,
                          Math.min(100, monthlyShare),
                        )}%`,
                      }}
                    />
                  </div>

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[9px] text-muted-foreground">
                    <span>
                      {formatCurrency(summary.received_value)} received value
                    </span>

                    <span>
                      {formatQuantity(summary.received_quantity)} units archived
                    </span>
                  </div>
                </div>
              </div>
            </button>

            <div className="grid min-w-0 sm:grid-cols-2 xl:grid-cols-4">
              <ArchiveMetric
                title="Received Orders"
                value={formatNumber(summary.total_orders)}
                description={`${formatNumber(summary.completed_this_month)} completed this month`}
                footerLabel="Monthly completion"
                footerValue={`${monthlyShare}%`}
                progress={monthlyShare}
                icon={PackageCheck}
                tone="emerald"
                onClick={() => openArchiveDrawer("all")}
                className="border-b border-border/60 sm:border-r xl:border-b-0"
              />

              <ArchiveMetric
                title="Receipt Records"
                value={formatNumber(summary.total_receipts)}
                description={`${formatDecimal(averageReceipts, 1)} average per order`}
                footerLabel="Receipt coverage"
                footerValue={`${formatDecimal(averageReceipts, 1)}×`}
                progress={Math.min(100, averageReceipts * 50)}
                icon={ReceiptText}
                tone="blue"
                onClick={() => openArchiveDrawer("receipts")}
                className="border-b border-border/60 xl:border-b-0 xl:border-r"
              />

              <ArchiveMetric
                title="Units Received"
                value={formatQuantity(summary.received_quantity)}
                description={`${formatQuantity(averageQuantity)} average per order`}
                footerLabel="Warehouse intake"
                footerValue="Fully received"
                progress={summary.total_orders > 0 ? 100 : 0}
                icon={Boxes}
                tone="violet"
                onClick={() => openArchiveDrawer("month")}
                className="border-b border-border/60 sm:border-b-0 sm:border-r"
              />

              <ArchiveMetric
                title="Received Value"
                value={formatCompactCurrency(summary.received_value)}
                description={`${formatCurrency(averageValue)} average order`}
                footerLabel="Archive valuation"
                footerValue={formatCurrency(summary.received_value)}
                progress={summary.total_orders > 0 ? 100 : 0}
                icon={CircleDollarSign}
                tone="amber"
                onClick={() => openArchiveDrawer("value")}
              />
            </div>
          </div>
        </section>

        <SectionCard
          title="Received Order Register"
          description="Review fully received purchase orders, supplier details, warehouse destinations, products, financial totals, workflow history, and every receipt record."
          actions={
            <Badge
              variant="outline"
              className="h-7 rounded-full border-emerald-500/15 bg-emerald-500/[0.06] px-2.5 text-[10px] font-medium text-emerald-300"
            >
              <History className="mr-1 size-3" />
              {formatNumber(received_orders.total)} order
              {received_orders.total === 1 ? "" : "s"}
            </Badge>
          }
        >
          <FilterBar
            onSubmit={applyFilters}
            contentClassName="grid w-full min-w-0 gap-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-[minmax(260px,1fr)_200px_210px_155px_155px]"
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
              placeholder="Search PO, receipt, supplier, branch, or warehouse..."
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
                    {supplier.name}
                    {supplier.code ? ` (${supplier.code})` : ""}
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
                    {warehouse.is_main ? " — Main" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <IconInput
              id="received_date_from"
              icon={CalendarDays}
              type="date"
              value={dateFrom}
              title="Completion date from"
              aria-label="Completion date from"
              onChange={(event) => setDateFrom(event.target.value)}
              className="h-10"
              iconClassName="text-primary"
            />

            <IconInput
              id="received_date_to"
              icon={CalendarDays}
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              title="Completion date to"
              aria-label="Completion date to"
              onChange={(event) => setDateTo(event.target.value)}
              className="h-10"
              iconClassName="text-primary"
            />
          </FilterBar>

          <ReceivedOrderTable
            orders={received_orders.data}
            onSelect={openOrderDetails}
            hasActiveFilters={hasActiveFilters}
          />

          <AppPagination
            pagination={received_orders}
            itemLabel="received orders"
          />
        </SectionCard>
      </PageContainer>
      <ReceivedOrderOverviewDrawer
        view={archiveDrawerView}
        pagination={received_orders}
        summary={summary}
        onClose={closeArchiveDrawer}
      />

      <ReceivedOrderDetailsDrawer
        order={selectedOrder}
        onClose={closeOrderDetails}
      />

    </AppLayout>
  );
}

/*
|--------------------------------------------------------------------------
| Main register table
|--------------------------------------------------------------------------
*/

function ReceivedOrderTable({
  orders,
  onSelect,
  hasActiveFilters,
}: {
  orders: ReceivedOrder[];
  onSelect: (order: ReceivedOrder) => void;
  hasActiveFilters: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-background/20 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1060px] border-collapse table-fixed">
          <thead className="border-b border-primary/10 bg-primary/[0.025]">
            <tr>
              <th className="w-[210px] px-4 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Purchase Order
              </th>
              <th className="w-[220px] px-4 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Supplier
              </th>
              <th className="w-[220px] px-4 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Destination
              </th>
              <th className="w-[190px] px-4 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Completion
              </th>
              <th className="w-[190px] px-4 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Received Summary
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border/60">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-14">
                  <div className="mx-auto flex max-w-sm flex-col items-center text-center">
                    <History className="size-7 text-muted-foreground" />
                    <h3 className="mt-3 text-sm font-semibold">
                      {hasActiveFilters
                        ? "No matching received orders"
                        : "No received orders yet"}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Fully received purchase orders will appear in this archive.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              orders.map((order) => (
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
                          {order.receipt_count} receipt{order.receipt_count === 1 ? "" : "s"} · {order.item_count} product{order.item_count === 1 ? "" : "s"}
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
                    <p className="text-[10px] font-semibold">
                      {formatDate(order.completed_date ?? order.completed_at)}
                    </p>
                    <p className="mt-1 text-[8px] text-muted-foreground">
                      Ordered {formatDate(order.order_date)}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-[11px] font-semibold tabular-nums">
                          {formatQuantity(order.received_quantity)} units
                        </p>
                        <p className="mt-1 text-[9px] font-semibold tabular-nums text-primary">
                          {formatCurrency(order.received_value)}
                        </p>
                      </div>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground group-hover:text-primary" />
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

function ReceivedOrderOverviewDrawer({
  view,
  pagination,
  summary,
  onClose,
}: {
  view: ReceivedOrderDrawerView | null;
  pagination: PaginatedReceivedOrders;
  summary: ReceivedOrderSummary;
  onClose: () => void;
}) {
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const activeView = view ?? "all";

  useEffect(() => {
    setExpandedOrderId(null);
  }, [view]);

  const config = {
    all: {
      title: "Received Orders",
      description: "Completed supplier orders loaded on the current page.",
      total: summary.total_orders,
    },
    receipts: {
      title: "Receipt Coverage",
      description: "Orders and their linked receiving records.",
      total: summary.total_receipts,
    },
    month: {
      title: "Completed This Month",
      description: "Recent completion activity represented in the archive.",
      total: summary.completed_this_month,
    },
    value: {
      title: "Received Value",
      description: "Completed order values and warehouse intake totals.",
      total: summary.received_value,
    },
  }[activeView];

  const monthKey = new Date().toISOString().slice(0, 7);
  const visibleOrders = pagination.data.filter((order) => {
    if (activeView !== "month") return true;
    const completed = order.completed_date ?? order.completed_at;
    return Boolean(completed && completed.slice(0, 7) === monthKey);
  });

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
          <p className="text-3xl font-semibold leading-none tabular-nums text-primary">
            {activeView === "value"
              ? formatCurrency(config.total)
              : formatNumber(config.total)}
          </p>
          <p className="mt-1 text-[9px] text-muted-foreground">
            Select an order to expand its archive details below.
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {visibleOrders.length === 0 ? (
            <div className="flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-background/20 p-6 text-center">
              <History className="size-6 text-muted-foreground" />
              <p className="mt-3 text-sm font-semibold">No loaded matches</p>
            </div>
          ) : (
            <div className="space-y-2">
              {visibleOrders.map((order) => {
                const expanded = expandedOrderId === order.id;

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
                      onClick={() =>
                        setExpandedOrderId((current) =>
                          current === order.id ? null : order.id,
                        )
                      }
                      aria-expanded={expanded}
                      className="flex w-full items-center gap-3 p-3 text-left transition hover:bg-primary/[0.035] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/35"
                    >
                      <EntityAvatar
                        icon={PackageCheck}
                        className="border-primary/15 bg-primary/[0.07] text-primary"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="break-words font-mono text-[10px] font-semibold text-primary">
                            {order.po_number}
                          </p>
                          <StatusBadge label={order.status_label} variant="success" />
                        </div>
                        <p className="mt-1 break-words text-[9px] text-muted-foreground">
                          {order.supplier.name} · {formatCurrency(order.received_value)}
                        </p>
                      </div>
                      <ChevronDown
                        className={cn(
                          "size-4 shrink-0 text-muted-foreground transition-transform",
                          expanded && "rotate-180 text-primary",
                        )}
                      />
                    </button>

                    {expanded && (
                      <div className="border-t border-border/60 bg-background/25 p-3">
                        <div className="grid grid-cols-2 gap-2">
                          <ReceivedAccordionMetric
                            label="Warehouse"
                            value={order.warehouse.name}
                          />
                          <ReceivedAccordionMetric
                            label="Completed"
                            value={formatDate(order.completed_date ?? order.completed_at)}
                          />
                          <ReceivedAccordionMetric
                            label="Received quantity"
                            value={formatQuantity(order.received_quantity)}
                          />
                          <ReceivedAccordionMetric
                            label="Receipts"
                            value={formatNumber(order.receipt_count)}
                          />
                        </div>

                        <div className="mt-3 rounded-lg border border-border/50 bg-background/30 p-3">
                          <p className="text-[8px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                            Product fulfillment
                          </p>
                          <div className="mt-2 space-y-2">
                            {order.items.slice(0, 4).map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between gap-3 text-[9px]"
                              >
                                <div className="min-w-0">
                                  <p className="break-words font-medium text-foreground/90">
                                    {item.product_name}
                                  </p>
                                  <p className="mt-0.5 font-mono text-[8px] text-muted-foreground">
                                    {item.product_sku ?? "NO SKU"}
                                  </p>
                                </div>
                                <span className="shrink-0 font-semibold tabular-nums text-primary">
                                  {formatQuantity(item.received_quantity)} / {formatQuantity(item.ordered_quantity)}
                                </span>
                              </div>
                            ))}
                            {order.items.length > 4 && (
                              <p className="text-[8px] text-muted-foreground">
                                +{order.items.length - 4} more product line
                                {order.items.length - 4 === 1 ? "" : "s"}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 rounded-lg border border-border/50 bg-background/30 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-[8px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                              Receipt history
                            </p>
                            <span className="text-[9px] font-semibold tabular-nums text-primary">
                              {formatCurrency(order.received_value)}
                            </span>
                          </div>

                          {order.receipts.length === 0 ? (
                            <p className="mt-2 text-[9px] text-muted-foreground">
                              No receipt records were returned.
                            </p>
                          ) : (
                            <div className="mt-2 space-y-2">
                              {order.receipts.slice(0, 3).map((receipt) => (
                                <div
                                  key={receipt.id}
                                  className="flex items-center justify-between gap-3 rounded-md border border-border/40 px-2.5 py-2"
                                >
                                  <div className="min-w-0">
                                    <p className="break-words font-mono text-[9px] font-semibold text-foreground">
                                      {receipt.receipt_number}
                                    </p>
                                    <p className="mt-0.5 text-[8px] text-muted-foreground">
                                      {formatDate(receipt.received_date)} · {receipt.status_label}
                                    </p>
                                  </div>
                                  <span className="shrink-0 text-[9px] font-semibold tabular-nums text-primary">
                                    {formatCurrency(receipt.total_amount)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
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

function ReceivedAccordionMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-border/50 bg-background/30 px-2.5 py-2">
      <p className="text-[7px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 break-words text-[9px] font-semibold text-foreground">
        {value}
      </p>
    </div>
  );
}

function ReceivedOrderDetailsDrawer({
  order,
  onClose,
}: {
  order: ReceivedOrder | null;
  onClose: () => void;
}) {
  return (
    <AppDrawer
      open={order !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title="Received Order Record"
      description="Review products, receipts, supplier context, warehouse destination, totals, and workflow history."
      processing={false}
    >
      {order && (
        <div className="min-h-full overflow-y-auto bg-card">
          <ExpandedReceivedOrder order={order} />
        </div>
      )}
    </AppDrawer>
  );
}

function ExpandedReceivedOrder({ order }: { order: ReceivedOrder }) {
  return (
    <div className="space-y-4 p-4">
      <section className="overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.065] via-card/95 to-card shadow-sm">
        <div className="border-b border-primary/10 bg-background/20 px-4 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-400">
                <PackageCheck className="size-4.5" />
              </span>
              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-emerald-400">
                  Completed supplier order
                </p>
                <h2 className="mt-1 break-words font-mono text-sm font-semibold text-foreground">
                  {order.po_number}
                </h2>
                <p className="mt-1 break-words text-[10px] leading-5 text-muted-foreground">
                  {order.supplier.name} · {order.warehouse.name}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <StatusBadge label={order.status_label} variant="success" />
              <Badge
                variant="outline"
                className="h-7 rounded-full border-primary/15 bg-primary/[0.055] px-2.5 text-[9px] font-semibold text-primary"
              >
                {formatNumber(order.receipt_count)} receipt
                {order.receipt_count === 1 ? "" : "s"}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-y divide-border/60 sm:grid-cols-4 sm:divide-y-0">
          <ReceivedHeroMetric
            label="Received value"
            value={formatCurrency(order.received_value)}
            helper="Final warehouse intake"
            valueClassName="text-primary"
          />
          <ReceivedHeroMetric
            label="Products"
            value={formatNumber(order.item_count)}
            helper="Completed product lines"
          />
          <ReceivedHeroMetric
            label="Quantity"
            value={formatQuantity(order.received_quantity)}
            helper="Total received units"
          />
          <ReceivedHeroMetric
            label="Completed"
            value={formatDate(order.completed_date ?? order.completed_at)}
            helper="Archive completion date"
          />
        </div>
      </section>

      <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
        <InfoPanel
          title="Supplier & Terms"
          description="Supplier identity and commercial information."
          icon={Truck}
          tone="amber"
          items={[
            ["Supplier", order.supplier.name],
            ["Code", order.supplier.code ?? "Not provided"],
            ["Contact", order.supplier.contact_person ?? "Not provided"],
            ["Phone", order.supplier.phone ?? "Not provided"],
            ["Email", order.supplier.email ?? "Not provided"],
            ["Payment", order.payment_terms ?? "Not configured"],
          ]}
        />

        <InfoPanel
          title="Destination & Dates"
          description="Receiving location and completion timeline."
          icon={Warehouse}
          tone="violet"
          items={[
            ["Branch", order.branch.name],
            ["Warehouse", order.warehouse.name],
            ["Order date", formatDate(order.order_date)],
            ["Expected", formatDate(order.expected_delivery_date)],
            ["First receipt", formatDate(order.first_received_date)],
            ["Completed", formatDateTime(order.completed_at)],
          ]}
        />

        <InfoPanel
          title="Financial Summary"
          description="Order calculation and final received value."
          icon={CircleDollarSign}
          tone="emerald"
          items={[
            ["Subtotal", formatCurrency(order.subtotal)],
            ["Discount", formatCurrency(order.discount_amount)],
            ["Tax", formatCurrency(order.tax_amount)],
            ["Shipping", formatCurrency(order.shipping_amount)],
            ["Order total", formatCurrency(order.total_amount)],
            ["Received value", formatCurrency(order.received_value)],
          ]}
        />

        <InfoPanel
          title="Workflow Trail"
          description="Creator, submission, approval, and receipt history."
          icon={Clock3}
          tone="blue"
          items={[
            ["Created by", formatUser(order.created_by)],
            ["Submitted by", formatUser(order.submitted_by)],
            ["Submitted at", formatDateTime(order.submitted_at)],
            ["Approved by", formatUser(order.approved_by)],
            ["Approved at", formatDateTime(order.approved_at)],
            [
              "Receipts",
              `${formatNumber(order.receipt_count)} record${
                order.receipt_count === 1 ? "" : "s"
              }`,
            ],
          ]}
        />
      </div>

      <OrderItemsTable order={order} />
      <ReceiptHistory order={order} />

      {order.notes && (
        <section className="rounded-2xl border border-primary/15 bg-primary/[0.035] p-4">
          <div className="flex items-start gap-3">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary">
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
    </div>
  );
}

function ReceivedHeroMetric({
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

function InfoPanel({
  title,
  description,
  icon: Icon,
  tone,
  items,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  tone: "amber" | "violet" | "emerald" | "blue";
  items: Array<[string, string]>;
}) {
  const tones = {
    amber: "border-amber-500/20 bg-amber-500/10 text-amber-400",
    violet: "border-violet-500/20 bg-violet-500/10 text-violet-300",
    emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    blue: "border-primary/20 bg-primary/10 text-primary",
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-border/70 bg-background/25">
      <div className="flex items-start gap-3 border-b border-border/60 bg-background/20 px-4 py-3">
        <span
          className={cn(
            "inline-flex size-8 shrink-0 items-center justify-center rounded-xl border",
            tones[tone],
          )}
        >
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold">{title}</p>
          <p className="mt-0.5 text-[8px] leading-4 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      <div className="divide-y divide-border/50 px-4">
        {items.map(([label, value]) => (
          <div
            key={label}
            className="grid grid-cols-[minmax(105px,0.42fr)_minmax(0,0.58fr)] gap-3 py-2.5"
          >
            <span className="text-[8px] font-medium uppercase tracking-[0.09em] text-muted-foreground">
              {label}
            </span>
            <span className="min-w-0 break-words text-right text-[10px] font-medium leading-4 text-foreground/85">
              {value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

/*
|--------------------------------------------------------------------------
| Products
|--------------------------------------------------------------------------
*/

function OrderItemsTable({ order }: { order: ReceivedOrder }) {
  return (
    <section className="overflow-hidden rounded-lg border border-border/60 bg-card/20">
      <div className="flex flex-col gap-2 border-b border-border/60 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold">Received Product Lines</p>

          <p className="mt-0.5 text-[9px] text-muted-foreground">
            Ordered quantity compared with final received quantity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="h-6 rounded-full border-violet-500/15 bg-violet-500/10 px-2.5 text-[9px] text-violet-300"
          >
            <Boxes className="mr-1 size-3" />
            {formatNumber(order.item_count)} product
            {order.item_count === 1 ? "" : "s"}
          </Badge>

          <Badge
            variant="outline"
            className="h-6 rounded-full border-emerald-500/15 bg-emerald-500/10 px-2.5 text-[9px] text-emerald-300"
          >
            <PackageCheck className="mr-1 size-3" />
            {formatQuantity(order.received_quantity)} received
          </Badge>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left">
          <thead className="border-b bg-muted/25">
            <tr className="text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Ordered</th>
              <th className="px-4 py-3 font-medium">Received</th>
              <th className="px-4 py-3 font-medium">Unit Cost</th>
              <th className="px-4 py-3 font-medium">Line Total</th>
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

                <td className="px-4 py-3 text-[11px] font-semibold tabular-nums text-primary">
                  {formatQuantity(item.received_quantity)}
                </td>

                <td className="px-4 py-3 text-[11px] tabular-nums text-muted-foreground">
                  {formatCurrency(item.unit_cost)}
                </td>

                <td className="px-4 py-3 text-[11px] font-semibold tabular-nums text-primary">
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
  );
}

/*
|--------------------------------------------------------------------------
| Receipts
|--------------------------------------------------------------------------
*/

function ReceiptHistory({ order }: { order: ReceivedOrder }) {
  return (
    <section className="overflow-hidden rounded-lg border border-border/60 bg-card/20">
      <div className="flex flex-col gap-2 border-b border-border/60 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold">Receipt History</p>

          <p className="mt-0.5 text-[9px] text-muted-foreground">
            Posted and voided delivery receipts linked to this purchase order.
          </p>
        </div>

        <Badge
          variant="outline"
          className="h-6 rounded-full border-blue-500/15 bg-blue-500/10 px-2.5 text-[9px] text-blue-300"
        >
          <ReceiptText className="mr-1 size-3" />
          {formatNumber(order.receipts.length)} record
          {order.receipts.length === 1 ? "" : "s"}
        </Badge>
      </div>

      <div className="grid gap-3 p-3 xl:grid-cols-2">
        {order.receipts.map((receipt) => (
          <ReceiptCard key={receipt.id} receipt={receipt} />
        ))}
      </div>
    </section>
  );
}

function ReceiptCard({ receipt }: { receipt: ReceiptRecord }) {
  const isVoided = receipt.status === "voided";

  return (
    <article
      className={cn(
        "overflow-hidden rounded-xl border bg-background/35",
        isVoided ? "border-red-500/15" : "border-blue-500/15",
      )}
    >
      <div className="flex flex-col gap-2 border-b border-border/50 px-3.5 py-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-2.5">
          <span
            className={cn(
              "inline-flex size-8 shrink-0 items-center justify-center rounded-lg border",
              isVoided
                ? "border-red-500/15 bg-red-500/10 text-red-400"
                : "border-blue-500/15 bg-blue-500/10 text-blue-400",
            )}
          >
            <ReceiptText className="size-4" />
          </span>

          <div className="min-w-0">
            <p className="truncate font-mono text-[10px] font-semibold">
              {receipt.receipt_number}
            </p>

            <p className="mt-1 truncate text-[9px] text-muted-foreground">
              {receipt.delivery_reference ?? "No delivery reference"}
            </p>
          </div>
        </div>

        <Badge
          variant="outline"
          className={cn(
            "h-6 rounded-full px-2 text-[8px] font-semibold",
            isVoided
              ? "border-red-500/20 bg-red-500/10 text-red-300"
              : "border-blue-500/20 bg-blue-500/10 text-blue-300",
          )}
        >
          {receipt.status_label}
        </Badge>
      </div>

      <div className="grid gap-2.5 p-3 sm:grid-cols-2">
        <ReceiptMetric
          label="Received date"
          value={formatDate(receipt.received_date)}
          icon={CalendarDays}
        />

        <ReceiptMetric
          label="Received by"
          value={formatUser(receipt.received_by)}
          icon={UserRound}
        />

        <ReceiptMetric
          label="Quantity"
          value={`${formatQuantity(receipt.total_quantity)} units`}
          icon={Boxes}
          valueClassName="text-primary"
        />

        <ReceiptMetric
          label="Receipt value"
          value={formatCurrency(receipt.total_amount)}
          icon={Banknote}
          valueClassName="text-primary"
        />
      </div>

      <div className="border-t border-border/50">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left">
            <thead className="border-b bg-muted/20">
              <tr className="text-[8px] uppercase tracking-[0.08em] text-muted-foreground">
                <th className="px-3 py-2.5 font-medium">Product</th>
                <th className="px-3 py-2.5 font-medium">Quantity</th>
                <th className="px-3 py-2.5 font-medium">Unit Cost</th>
                <th className="px-3 py-2.5 font-medium">Amount</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border/40">
              {receipt.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-3 py-2.5">
                    <p className="max-w-[200px] truncate text-[9px] font-medium">
                      {item.product_name}
                    </p>

                    <p className="mt-0.5 font-mono text-[8px] text-muted-foreground">
                      {item.product_sku ?? "NO SKU"} · {item.unit}
                    </p>
                  </td>

                  <td className="px-3 py-2.5 text-[9px] font-semibold tabular-nums">
                    {formatQuantity(item.quantity_received)}
                  </td>

                  <td className="px-3 py-2.5 text-[9px] tabular-nums text-muted-foreground">
                    {formatCurrency(item.unit_cost)}
                  </td>

                  <td className="px-3 py-2.5 text-[9px] font-semibold tabular-nums text-primary">
                    {formatCurrency(item.line_total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(receipt.notes || receipt.void_reason) && (
        <div className="space-y-2 border-t border-border/50 p-3">
          {receipt.notes && (
            <TextBlock label="Receipt notes" value={receipt.notes} />
          )}

          {receipt.void_reason && (
            <TextBlock label="Void reason" value={receipt.void_reason} danger />
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/50 px-3 py-2.5 text-[8px] text-muted-foreground">
        <span>Posted {formatDateTime(receipt.posted_at)}</span>

        {isVoided && (
          <span className="text-red-300">
            Voided {formatDateTime(receipt.voided_at)} by{" "}
            {formatUser(receipt.voided_by)}
          </span>
        )}
      </div>
    </article>
  );
}

/*
|--------------------------------------------------------------------------
| Small UI helpers
|--------------------------------------------------------------------------
*/


function ReceiptMetric({
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
    <div className="rounded-lg border border-border/50 bg-card/20 p-2.5">
      <div className="flex items-center gap-2 text-[8px] uppercase tracking-[0.08em] text-muted-foreground">
        <Icon className="size-3" />
        {label}
      </div>

      <p
        className={cn(
          "mt-1.5 break-words text-[9px] font-semibold",
          valueClassName,
        )}
      >
        {value}
      </p>
    </div>
  );
}

function TextBlock({
  label,
  value,
  danger = false,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2.5",
        danger
          ? "border-red-500/15 bg-red-500/[0.045]"
          : "border-border/50 bg-card/20",
      )}
    >
      <p
        className={cn(
          "text-[8px] font-semibold uppercase tracking-[0.08em]",
          danger ? "text-red-300" : "text-muted-foreground",
        )}
      >
        {label}
      </p>

      <p className="mt-1 whitespace-pre-wrap break-words text-[9px] leading-4 text-muted-foreground">
        {value}
      </p>
    </div>
  );
}

function ArchiveMetric({
  title,
  value,
  description,
  footerLabel,
  footerValue,
  progress,
  icon: Icon,
  tone,
  onClick,
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
  onClick: () => void;
  className?: string;
}) {
  const tones = {
    blue: {
      icon: "border-primary/15 bg-primary/10 text-primary",
      bar: "bg-primary",
      value: "text-primary",
    },
    amber: {
      icon: "border-amber-500/15 bg-amber-500/10 text-amber-400",
      bar: "bg-amber-400",
      value: "text-amber-400",
    },
    violet: {
      icon: "border-violet-500/15 bg-violet-500/10 text-violet-300",
      bar: "bg-violet-400",
      value: "text-violet-300",
    },
    emerald: {
      icon: "border-emerald-500/15 bg-emerald-500/10 text-emerald-400",
      bar: "bg-emerald-400",
      value: "text-emerald-300",
    },
  } as const;

  const selected = tones[tone];

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
              selected.value,
            )}
          >
            {value}
          </p>

          <p className="mt-1 truncate text-[9px] text-muted-foreground">
            {description}
          </p>
        </div>

        <span
          className={cn(
            "inline-flex size-8 shrink-0 items-center justify-center rounded-lg border transition-transform group-hover:scale-105",
            selected.icon,
          )}
        >
          <Icon className="size-4" />
        </span>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between gap-3 text-[8px] text-muted-foreground">
          <span>{footerLabel}</span>
          <span className="truncate font-medium text-foreground/75">
            {footerValue}
          </span>
        </div>

        <div className="mt-2 h-1 overflow-hidden rounded-full bg-background/60">
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-500",
              selected.bar,
            )}
            style={{
              width: `${Math.max(0, Math.min(100, progress))}%`,
            }}
          />
        </div>
      </div>
    </button>
  );
}

/*
|--------------------------------------------------------------------------
| Formatting
|--------------------------------------------------------------------------
*/

function formatNumber(value: number | string | null): string {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("en-PH").format(
    Number.isFinite(amount) ? amount : 0,
  );
}

function formatDecimal(value: number, digits: number): string {
  return new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Number.isFinite(value) ? value : 0);
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

function formatCompactCurrency(value: number | string | null): string {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    notation: "compact",
    maximumFractionDigits: 1,
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

  const date = new Date(`${value.slice(0, 10)}T00:00:00`);

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

function formatUser(user: UserReference | null): string {
  if (!user) {
    return "Not recorded";
  }

  return user.name || user.email || `User #${user.id}`;
}