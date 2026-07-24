import { ActionGroup } from "@/components/shared/action-group";
import { AppPagination } from "@/components/shared/app-pagination";
import { BooleanField } from "@/components/shared/boolean-field";
import { CalloutCard } from "@/components/shared/callout-card";
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
import { Head, Link, router, useForm } from "@inertiajs/react";
import {
  Activity,
  Boxes,
  Building2,
  CircleGauge,
  MapPin,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  ShieldCheck,
  Star,
  Trash2,
  User,
  Warehouse as WarehouseIcon,
  type LucideIcon,
} from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";

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
  is_active: boolean;
};

type Warehouse = {
  id: number;
  tenant_id: number;
  branch_id: number;
  name: string;
  code: string;
  description: string | null;
  address: string | null;
  contact_person: string | null;
  phone: string | null;
  is_main: boolean;
  is_active: boolean;
  stocks_count: number;
  stock_movements_count: number;
  branch: BranchOption | null;
  created_at: string | null;
  updated_at: string | null;
};

type PaginationLink = {
  url: string | null;
  label: string;
  active: boolean;
};

type PaginatedWarehouses = {
  current_page: number;
  data: Warehouse[];
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

type WarehouseSummary = {
  total: number;
  active: number;
  inactive: number;
  main: number;
};

type WarehouseFilters = {
  search: string;
  status: string;
  branch_id: number | null;
};

type WarehouseFormData = {
  branch_id: string;
  name: string;
  code: string;
  description: string;
  address: string;
  contact_person: string;
  phone: string;
  is_main: boolean;
  is_active: boolean;
};

type WarehousePageProps = {
  warehouses: PaginatedWarehouses;
  branches: BranchOption[];
  summary: WarehouseSummary;
  filters: WarehouseFilters;
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
    title: "Warehouses",
    href: "/locations/warehouses",
  },
];

const ALL_VALUE = "all";
const NONE_VALUE = "none";

function getDefaultBranchId(branches: BranchOption[]): string {
  const activeBranch = branches.find((branch) => branch.is_active);

  if (activeBranch) {
    return String(activeBranch.id);
  }

  return branches[0] ? String(branches[0].id) : "";
}

function getEmptyWarehouseForm(branches: BranchOption[]): WarehouseFormData {
  return {
    branch_id: getDefaultBranchId(branches),
    name: "",
    code: "",
    description: "",
    address: "",
    contact_person: "",
    phone: "",
    is_main: false,
    is_active: true,
  };
}

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function WarehouseIndex({
  warehouses,
  branches,
  summary,
  filters,
}: WarehousePageProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(
    null,
  );

  const [statusConfirmTarget, setStatusConfirmTarget] =
    useState<Warehouse | null>(null);

  const [statusProcessingId, setStatusProcessingId] = useState<number | null>(
    null,
  );

  const [deleteTarget, setDeleteTarget] = useState<Warehouse | null>(null);

  const [deleteProcessing, setDeleteProcessing] = useState(false);

  const [search, setSearch] = useState(filters.search ?? "");

  const [status, setStatus] = useState(filters.status ?? "");

  const [branchId, setBranchId] = useState(
    filters.branch_id ? String(filters.branch_id) : "",
  );

  const form = useForm<WarehouseFormData>(getEmptyWarehouseForm(branches));

  useEffect(() => {
    setSearch(filters.search ?? "");
    setStatus(filters.status ?? "");
    setBranchId(filters.branch_id ? String(filters.branch_id) : "");
  }, [filters.search, filters.status, filters.branch_id]);

  /*
    |--------------------------------------------------------------------------
    | Form dialog
    |--------------------------------------------------------------------------
    */

  function resetWarehouseForm(): void {
    form.clearErrors();
    form.setData(getEmptyWarehouseForm(branches));
  }

  function resetAndCloseDialog(): void {
    setIsDialogOpen(false);
    setEditingWarehouse(null);
    resetWarehouseForm();
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
    setEditingWarehouse(null);
    resetWarehouseForm();
    setIsDialogOpen(true);
  }

  function openEditDialog(warehouse: Warehouse): void {
    setEditingWarehouse(warehouse);
    form.clearErrors();

    form.setData({
      branch_id: String(warehouse.branch_id),
      name: warehouse.name,
      code: warehouse.code,
      description: warehouse.description ?? "",
      address: warehouse.address ?? "",
      contact_person: warehouse.contact_person ?? "",
      phone: warehouse.phone ?? "",
      is_main: warehouse.is_main,
      is_active: warehouse.is_active,
    });

    setIsDialogOpen(true);
  }

  function submitWarehouse(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (editingWarehouse) {
      form.put(`/locations/warehouses/${editingWarehouse.id}`, {
        preserveScroll: true,
        onSuccess: resetAndCloseDialog,
      });

      return;
    }

    form.post("/locations/warehouses", {
      preserveScroll: true,
      onSuccess: resetAndCloseDialog,
    });
  }

  /*
    |--------------------------------------------------------------------------
    | Filters
    |--------------------------------------------------------------------------
    */

  function applyFilters(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    router.get(
      "/locations/warehouses",
      {
        search: search.trim() || undefined,
        status: status || undefined,
        branch_id: branchId || undefined,
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
    setBranchId("");

    router.get(
      "/locations/warehouses",
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
    | Status
    |--------------------------------------------------------------------------
    */

  function requestStatusToggle(warehouse: Warehouse): void {
    if (warehouse.is_main && warehouse.is_active) {
      setStatusConfirmTarget(warehouse);
      return;
    }

    updateWarehouseStatus(warehouse);
  }

  function updateWarehouseStatus(warehouse: Warehouse): void {
    if (statusProcessingId === warehouse.id) {
      return;
    }

    router.patch(
      `/locations/warehouses/${warehouse.id}/status`,
      {
        is_active: !warehouse.is_active,
      },
      {
        preserveScroll: true,
        onStart: () => setStatusProcessingId(warehouse.id),
        onSuccess: () => setStatusConfirmTarget(null),
        onFinish: () => setStatusProcessingId(null),
      },
    );
  }

  /*
    |--------------------------------------------------------------------------
    | Delete
    |--------------------------------------------------------------------------
    */

  function requestDelete(warehouse: Warehouse): void {
    setDeleteTarget(warehouse);
  }

  function deleteWarehouse(): void {
    if (!deleteTarget || deleteProcessing) {
      return;
    }

    router.delete(`/locations/warehouses/${deleteTarget.id}`, {
      preserveScroll: true,
      onStart: () => setDeleteProcessing(true),
      onSuccess: () => setDeleteTarget(null),
      onFinish: () => setDeleteProcessing(false),
    });
  }

  /*
    |--------------------------------------------------------------------------
    | Table columns
    |--------------------------------------------------------------------------
    */

  const warehouseColumns: DataTableColumn<Warehouse>[] = [
    {
      key: "warehouse",
      header: "Warehouse",
      className: "min-w-[245px]",
      cell: (warehouse) => (
        <EntityInfo
          avatar={
            <EntityAvatar
              icon={WarehouseIcon}
              className="border-primary/20 bg-primary/10 text-primary group-hover:border-primary/30 group-hover:bg-primary/15"
            />
          }
          title={warehouse.name}
          badges={
            warehouse.is_main ? (
              <Badge
                variant="outline"
                className="h-5 gap-1 rounded-full border-amber-500/20 bg-amber-500/10 px-2 text-[9px] font-semibold text-amber-300"
              >
                <Star className="size-2.5 fill-current" />
                MAIN
              </Badge>
            ) : undefined
          }
          subtitle={
            <>
              Code:{" "}
              <span className="font-mono font-semibold text-foreground/75">
                {warehouse.code}
              </span>
            </>
          }
          description={warehouse.description ?? "No description provided"}
        />
      ),
    },
    {
      key: "branch",
      header: "Branch Assignment",
      className: "min-w-[190px]",
      cell: (warehouse) =>
        warehouse.branch ? (
          <div className="flex items-start gap-2.5">
            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
              <Building2 className="size-4" />
            </span>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="max-w-[145px] truncate text-[12px] font-semibold">
                  {warehouse.branch.name}
                </p>

                {warehouse.branch.is_main && (
                  <Star className="size-3 fill-amber-400 text-amber-400" />
                )}
              </div>

              <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                {warehouse.branch.code}
              </p>
            </div>
          </div>
        ) : (
          <span className="text-[11px] text-muted-foreground">
            No branch assigned
          </span>
        ),
    },
    {
      key: "location",
      header: "Location",
      className: "min-w-[215px]",
      cell: (warehouse) => (
        <div className="flex max-w-[245px] items-start gap-2.5">
          <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
            <MapPin className="size-3.5" />
          </span>

          <p className="text-[11px] leading-5 text-foreground/80">
            {warehouse.address ?? "No address provided"}
          </p>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Custodian",
      className: "min-w-[195px]",
      cell: (warehouse) => (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[11px]">
            <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <User className="size-3" />
            </span>

            <span
              className={
                warehouse.contact_person
                  ? "max-w-[150px] truncate text-foreground/80"
                  : "text-muted-foreground"
              }
            >
              {warehouse.contact_person ?? "No contact person"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Phone className="size-3" />
            </span>

            <span
              className={
                warehouse.phone ? "text-foreground/80" : "text-muted-foreground"
              }
            >
              {warehouse.phone ?? "No phone"}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "inventory",
      header: "Inventory Activity",
      className: "min-w-[175px]",
      cell: (warehouse) => (
        <div className="grid grid-cols-2 gap-2">
          <InventoryCount
            icon={Boxes}
            value={warehouse.stocks_count}
            label="Stock records"
          />

          <InventoryCount
            icon={Activity}
            value={warehouse.stock_movements_count}
            label="Movements"
          />
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      className: "min-w-[110px]",
      cell: (warehouse) => (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={statusProcessingId === warehouse.id}
          onClick={() => requestStatusToggle(warehouse)}
          className="h-auto rounded-full p-0 disabled:opacity-60"
        >
          <StatusBadge
            label={warehouse.is_active ? "Active" : "Inactive"}
            variant={warehouse.is_active ? "success" : "danger"}
          />
        </Button>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      cell: (warehouse) => (
        <ActionGroup>
          <IconButton
            label="Edit warehouse"
            onClick={() => openEditDialog(warehouse)}
            className="text-primary hover:bg-primary/10 hover:text-primary"
          >
            <Pencil className="size-3.5" />
          </IconButton>

          <IconButton
            label={
              warehouse.stocks_count > 0 || warehouse.stock_movements_count > 0
                ? "Warehouse has inventory history"
                : "Delete warehouse"
            }
            onClick={() => requestDelete(warehouse)}
            className="text-red-400 hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 className="size-3.5" />
          </IconButton>
        </ActionGroup>
      ),
    },
  ];

  /*
    |--------------------------------------------------------------------------
    | Derived values
    |--------------------------------------------------------------------------
    */

  const operationalPercentage =
    summary.total > 0 ? Math.round((summary.active / summary.total) * 100) : 0;

  const inactivePercentage =
    summary.total > 0
      ? Math.round((summary.inactive / summary.total) * 100)
      : 0;

  const activeBranchCount = branches.filter(
    (branch) => branch.is_active,
  ).length;

  const branchCoverageBase =
    activeBranchCount > 0 ? activeBranchCount : branches.length;

  const mainCoveragePercentage =
    branchCoverageBase > 0
      ? Math.min(100, Math.round((summary.main / branchCoverageBase) * 100))
      : 0;

  const branchesWithoutPrimary = Math.max(0, branchCoverageBase - summary.main);

  const hasInventoryHistory = Boolean(
    deleteTarget &&
      (deleteTarget.stocks_count > 0 || deleteTarget.stock_movements_count > 0),
  );

  const networkHealthLabel =
    summary.total === 0
      ? "No storage locations"
      : summary.inactive === 0
        ? "Storage network ready"
        : `${summary.inactive} location${
            summary.inactive === 1 ? "" : "s"
          } unavailable`;

  /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Warehouse Management" />

      <PageContainer className="gap-4 md:gap-5">
        {branches.length === 0 && (
          <CalloutCard
            tone="warning"
            icon={Building2}
            title="No branch available"
            description="Create a business branch before registering warehouse locations."
            actions={
              <Button asChild type="button" variant="outline" size="sm">
                <Link href="/locations/branches">Manage Branches</Link>
              </Button>
            }
          />
        )}

        {/* Warehouse operational control board */}

        <section className="grid min-w-0 gap-3 xl:grid-cols-[280px_minmax(0,1fr)]">
          {/* Donut readiness gauge */}

          <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.10] via-card/70 to-card/40 p-4">
            <div className="pointer-events-none absolute -left-16 -top-16 size-44 rounded-full bg-primary/10 blur-3xl" />
            <WarehouseIcon className="pointer-events-none absolute -bottom-8 -right-6 size-28 text-primary opacity-[0.025]" />

            <div className="relative flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-primary">
                  Operational Readiness
                </p>

                <p className="mt-1 text-[10px] text-muted-foreground">
                  Live storage availability
                </p>
              </div>

              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                <CircleGauge className="size-4" />
              </span>
            </div>

            <div className="relative mt-3 flex justify-center">
              <div className="relative size-32">
                <svg
                  viewBox="0 0 120 120"
                  className="size-full -rotate-90"
                  role="img"
                  aria-label={`${operationalPercentage}% of warehouses are active`}
                >
                  <circle
                    cx="60"
                    cy="60"
                    r="49"
                    pathLength="100"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="9"
                    className="text-muted/80"
                  />

                  <circle
                    cx="60"
                    cy="60"
                    r="49"
                    pathLength="100"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="9"
                    strokeLinecap="round"
                    strokeDasharray={`${operationalPercentage} ${100 - operationalPercentage}`}
                    className="text-primary transition-all duration-700"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[26px] font-semibold leading-none tracking-[-0.04em] text-primary tabular-nums">
                    {operationalPercentage}%
                  </span>

                  <span className="mt-1 text-[8px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Ready
                  </span>
                </div>
              </div>
            </div>

            <div className="relative mt-2 flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/45 px-3 py-2.5">
              <div>
                <p className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
                  Available
                </p>

                <p className="mt-1 text-sm font-semibold tabular-nums">
                  {summary.active} of {summary.total}
                </p>
              </div>

              <Badge
                variant="outline"
                className={cn(
                  "h-6 rounded-full px-2.5 text-[9px] font-semibold",
                  summary.total === 0
                    ? "border-slate-500/20 bg-slate-500/10 text-slate-300"
                    : summary.inactive === 0
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                      : "border-amber-500/20 bg-amber-500/10 text-amber-300",
                )}
              >
                <ShieldCheck className="mr-1 size-3" />
                {networkHealthLabel}
              </Badge>
            </div>
          </div>

          {/* Storage control board */}

          <div className="min-w-0 overflow-hidden rounded-2xl border border-border/60 bg-card/55">
            <div className="flex flex-col gap-3 border-b border-border/60 bg-muted/[0.025] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex size-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                  <Boxes className="size-4" />
                </span>

                <div>
                  <p className="text-[12px] font-semibold">
                    Storage Control Board
                  </p>

                  <p className="mt-0.5 text-[9px] text-muted-foreground">
                    Footprint, availability, and primary assignment coverage
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                {summary.active} active
                <span className="ml-2 size-1.5 rounded-full bg-red-400" />
                {summary.inactive} inactive
              </div>
            </div>

            <div className="grid min-w-0 sm:grid-cols-3">
              <StorageSnapshot
                title="Storage Locations"
                value={summary.total}
                description="Registered warehouses"
                icon={WarehouseIcon}
                tone="primary"
                className="border-b border-border/60 sm:border-b-0 sm:border-r"
              />

              <StorageSnapshot
                title="Branch Footprint"
                value={branches.length}
                description={`${activeBranchCount} active branch${activeBranchCount === 1 ? "" : "es"}`}
                icon={Building2}
                tone="primary"
                className="border-b border-border/60 sm:border-b-0 sm:border-r"
              />

              <StorageSnapshot
                title="Primary Warehouses"
                value={summary.main}
                description="Main storage assignments"
                icon={Star}
                tone="amber"
              />
            </div>

            <div className="grid min-w-0 border-t border-border/60 md:grid-cols-2">
              <div className="border-b border-border/60 p-4 md:border-b-0 md:border-r">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                      Operational Balance
                    </p>

                    <p className="mt-1 text-[10px] text-muted-foreground">
                      Active versus unavailable storage locations
                    </p>
                  </div>

                  <span className="text-sm font-semibold tabular-nums text-emerald-400">
                    {summary.active}/{summary.total}
                  </span>
                </div>

                <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-500"
                    style={{ width: `${operationalPercentage}%` }}
                  />

                  <div
                    className="h-full bg-red-400 transition-all duration-500"
                    style={{ width: `${inactivePercentage}%` }}
                  />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[9px]">
                  <span className="inline-flex items-center gap-1.5 text-emerald-400">
                    <span className="size-1.5 rounded-full bg-emerald-400" />
                    {summary.active} operational
                  </span>

                  <span className="inline-flex items-center gap-1.5 text-red-400">
                    <span className="size-1.5 rounded-full bg-red-400" />
                    {summary.inactive} unavailable
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                      Primary Coverage
                    </p>

                    <p className="mt-1 text-[10px] text-muted-foreground">
                      Main warehouse assignment across active branches
                    </p>
                  </div>

                  <span className="text-sm font-semibold tabular-nums text-amber-400">
                    {mainCoveragePercentage}%
                  </span>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all duration-500"
                    style={{ width: `${mainCoveragePercentage}%` }}
                  />
                </div>

                <div className="mt-3 flex items-center gap-2.5 rounded-lg border border-amber-500/10 bg-amber-500/[0.035] px-3 py-2">
                  <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                    <Star className="size-3.5" />
                  </span>

                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-foreground/85">
                      {branchCoverageBase === 0
                        ? "No branch coverage yet"
                        : branchesWithoutPrimary === 0
                          ? "Primary coverage complete"
                          : `${branchesWithoutPrimary} branch${branchesWithoutPrimary === 1 ? "" : "es"} without primary storage`}
                    </p>

                    <p className="mt-0.5 text-[9px] text-muted-foreground">
                      {summary.main} main warehouse assignment
                      {summary.main === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Warehouse directory */}

        <SectionCard
          title="Storage Locations"
          description="Browse warehouse assignments, custodians, inventory activity, and operational status."
          actions={
            <Button
              type="button"
              disabled={branches.length === 0}
              onClick={openCreateDialog}
              className="h-9 rounded-lg px-3.5 text-xs"
            >
              <Plus className="size-3.5" />
              Add Warehouse
            </Button>
          }
        >
          <FilterBar
            onSubmit={applyFilters}
            contentClassName="grid w-full min-w-0 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(240px,1fr)_190px_170px]"
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
                  <RefreshCw className="size-3.5" />
                  Reset
                </Button>
              </>
            }
          >
            <SearchInput
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onClear={() => setSearch("")}
              placeholder="Search warehouse, code, location, or contact..."
              className="sm:col-span-2 xl:col-span-1"
            />

            <Select
              value={branchId || ALL_VALUE}
              onValueChange={(value) =>
                setBranchId(value === ALL_VALUE ? "" : value)
              }
            >
              <SelectTrigger className="h-10 w-full text-sm">
                <SelectValue placeholder="All branches" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value={ALL_VALUE}>All branches</SelectItem>

                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={String(branch.id)}>
                    {branch.name} ({branch.code})
                    {!branch.is_active ? " — Inactive" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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

                <SelectItem value="active">Active</SelectItem>

                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </FilterBar>

          <DataTable
            data={warehouses.data}
            columns={warehouseColumns}
            getRowKey={(warehouse) => warehouse.id}
            emptyIcon={WarehouseIcon}
            emptyTitle="No warehouses found"
            emptyDescription="Register a warehouse under an existing branch to begin managing storage operations."
            emptyAction={
              branches.length > 0 ? (
                <Button type="button" onClick={openCreateDialog}>
                  <Plus className="size-4" />
                  Add Warehouse
                </Button>
              ) : (
                <Button asChild type="button">
                  <Link href="/locations/branches">
                    <Building2 className="size-4" />
                    Create Branch
                  </Link>
                </Button>
              )
            }
            minWidth="1120px"
          />

          <AppPagination pagination={warehouses} itemLabel="warehouses" />
        </SectionCard>
      </PageContainer>

      {/* Create and edit dialog */}

      <FormDialog
        open={isDialogOpen}
        onOpenChange={handleDialogOpenChange}
        title={editingWarehouse ? "Edit Warehouse" : "Add Warehouse"}
        description={
          editingWarehouse
            ? `Update the storage information for ${editingWarehouse.name}.`
            : "Register a warehouse under an existing business branch."
        }
        onSubmit={submitWarehouse}
        processing={form.processing}
        submitText={editingWarehouse ? "Save Changes" : "Create Warehouse"}
        processingText={
          editingWarehouse ? "Saving Changes..." : "Creating Warehouse..."
        }
        maxWidth="max-w-3xl"
      >
        <FormSection
          title="Branch Assignment"
          description="Select the business branch that owns this warehouse."
          icon={<Building2 />}
        >
          <FormField
            id="branch_id"
            label="Branch"
            error={form.errors.branch_id}
            required
          >
            <Select
              value={form.data.branch_id || NONE_VALUE}
              disabled={form.processing}
              onValueChange={(value) =>
                form.setData("branch_id", value === NONE_VALUE ? "" : value)
              }
            >
              <SelectTrigger id="branch_id">
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value={NONE_VALUE}>Select branch</SelectItem>

                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={String(branch.id)}>
                    {branch.name} ({branch.code})
                    {!branch.is_active ? " — Inactive" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </FormSection>

        <FormSection
          title="Warehouse Identity"
          description="Enter the identifying details for this storage location."
          icon={<WarehouseIcon />}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              id="name"
              label="Warehouse Name"
              error={form.errors.name}
              required
            >
              <Input
                id="name"
                type="text"
                value={form.data.name}
                disabled={form.processing}
                onChange={(event) => form.setData("name", event.target.value)}
                placeholder="Main Warehouse"
                autoComplete="off"
                autoFocus
              />
            </FormField>

            <FormField
              id="code"
              label="Warehouse Code"
              description="Use a short unique storage code."
              error={form.errors.code}
              required
            >
              <Input
                id="code"
                type="text"
                value={form.data.code}
                disabled={form.processing}
                onChange={(event) =>
                  form.setData("code", event.target.value.toUpperCase())
                }
                placeholder="WH-MAIN"
                className="font-mono uppercase"
                autoComplete="off"
              />
            </FormField>
          </div>

          <FormField
            id="description"
            label="Description"
            error={form.errors.description}
          >
            <Textarea
              id="description"
              rows={3}
              value={form.data.description}
              disabled={form.processing}
              onChange={(event) =>
                form.setData("description", event.target.value)
              }
              placeholder="Optional warehouse description"
              className="resize-none"
            />
          </FormField>
        </FormSection>

        <FormSection
          title="Location and Custodian"
          description="Record the physical address and responsible contact person."
          icon={<MapPin />}
        >
          <FormField
            id="address"
            label="Warehouse Address"
            error={form.errors.address}
          >
            <Textarea
              id="address"
              rows={3}
              value={form.data.address}
              disabled={form.processing}
              onChange={(event) => form.setData("address", event.target.value)}
              placeholder="Complete warehouse address"
              className="resize-none"
            />
          </FormField>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              id="contact_person"
              label="Contact Person"
              error={form.errors.contact_person}
            >
              <IconInput
                id="contact_person"
                icon={User}
                type="text"
                value={form.data.contact_person}
                disabled={form.processing}
                onChange={(event) =>
                  form.setData("contact_person", event.target.value)
                }
                placeholder="Warehouse supervisor"
                autoComplete="off"
              />
            </FormField>

            <FormField
              id="phone"
              label="Phone Number"
              error={form.errors.phone}
            >
              <IconInput
                id="phone"
                icon={Phone}
                type="text"
                inputMode="tel"
                value={form.data.phone}
                disabled={form.processing}
                onChange={(event) => form.setData("phone", event.target.value)}
                placeholder="09XXXXXXXXX"
                autoComplete="tel"
                iconClassName="group-focus-within:text-primary"
              />
            </FormField>
          </div>
        </FormSection>

        <FormSection
          title="Operational Settings"
          description="Configure the warehouse role and availability."
          icon={<ShieldCheck />}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <BooleanField
              id="is_main"
              checked={form.data.is_main}
              disabled={form.processing}
              onCheckedChange={(checked) =>
                form.setData({
                  ...form.data,
                  is_main: checked,
                  is_active: checked ? true : form.data.is_active,
                })
              }
              label="Main Warehouse"
              description="Set this as the primary warehouse of the selected branch."
              error={form.errors.is_main}
              className="h-full border-amber-500/15 bg-amber-500/[0.035]"
            />

            <BooleanField
              id="is_active"
              checked={form.data.is_active}
              disabled={form.processing || form.data.is_main}
              onCheckedChange={(checked) => form.setData("is_active", checked)}
              label="Active Warehouse"
              description={
                form.data.is_main
                  ? "A main warehouse must remain active."
                  : "Allow stock records and movements to use this warehouse."
              }
              error={form.errors.is_active}
              className="h-full border-emerald-500/15 bg-emerald-500/[0.035]"
            />
          </div>
        </FormSection>
      </FormDialog>

      {/* Main warehouse status confirmation */}

      <ConfirmDialog
        open={statusConfirmTarget !== null}
        onOpenChange={(open) => {
          if (!open && statusProcessingId === null) {
            setStatusConfirmTarget(null);
          }
        }}
        title="Deactivate Main Warehouse"
        description={`"${statusConfirmTarget?.name}" is currently the main warehouse of its branch. Another active warehouse may need to be assigned before deactivation.`}
        confirmText="Deactivate Warehouse"
        processing={
          statusConfirmTarget
            ? statusProcessingId === statusConfirmTarget.id
            : false
        }
        destructive
        onConfirm={() => {
          if (statusConfirmTarget) {
            updateWarehouseStatus(statusConfirmTarget);
          }
        }}
      />

      {/* Delete confirmation */}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !deleteProcessing) {
            setDeleteTarget(null);
          }
        }}
        title="Delete Warehouse"
        description={
          hasInventoryHistory
            ? `"${deleteTarget?.name}" contains ${deleteTarget?.stocks_count ?? 0} stock record(s) and ${deleteTarget?.stock_movements_count ?? 0} movement record(s). The system may prevent deletion to preserve inventory history.`
            : deleteTarget?.is_main
              ? `"${deleteTarget.name}" is marked as the main warehouse. Another warehouse may need to be assigned as main before deletion.`
              : `Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`
        }
        confirmText="Delete Warehouse"
        processing={deleteProcessing}
        destructive
        onConfirm={deleteWarehouse}
      />
    </AppLayout>
  );
}

/*
|--------------------------------------------------------------------------
| Storage snapshot
|--------------------------------------------------------------------------
*/

function StorageSnapshot({
  title,
  value,
  description,
  icon: Icon,
  tone,
  className,
}: {
  title: string;
  value: number;
  description: string;
  icon: LucideIcon;
  tone: "primary" | "amber";
  className?: string;
}) {
  const toneStyles = {
    primary: {
      icon: "border-primary/20 bg-primary/10 text-primary",
      value: "text-primary",
      glow: "bg-primary/10",
    },
    amber: {
      icon: "border-amber-500/20 bg-amber-500/10 text-amber-400",
      value: "text-amber-400",
      glow: "bg-amber-500/10",
    },
  } as const;

  const styles = toneStyles[tone];

  return (
    <div
      className={cn(
        "group relative min-w-0 overflow-hidden px-4 py-3.5",
        "transition-colors hover:bg-muted/[0.025]",
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
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Inventory count
|--------------------------------------------------------------------------
*/

function InventoryCount({
  icon: Icon,
  value,
  label,
}: {
  icon: LucideIcon;
  value: number;
  label: string;
}) {
  const style = "border-primary/15 bg-primary/[0.045] text-primary";

  return (
    <div className={cn("min-w-0 rounded-lg border px-2.5 py-2", style)}>
      <div className="flex items-center gap-1.5">
        <Icon className="size-3" />

        <span className="text-[12px] font-semibold tabular-nums text-foreground">
          {value}
        </span>
      </div>

      <p className="mt-1 truncate text-[8px] text-muted-foreground">{label}</p>
    </div>
  );
}