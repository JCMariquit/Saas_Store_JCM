import { AppDrawer } from "@/components/shared/app-drawer";
import { AppPagination } from "@/components/shared/app-pagination";
import { BooleanField } from "@/components/shared/boolean-field";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EntityAvatar } from "@/components/shared/entity-avatar";
import { EntityInfo } from "@/components/shared/entity-info";
import { FilterBar } from "@/components/shared/filter-bar";
import { FormDialog } from "@/components/shared/form-dialog";
import { FormField } from "@/components/shared/form-field";
import { FormSection } from "@/components/shared/form-section";
import { IconInput } from "@/components/shared/icon-input";
import { MoneyInput } from "@/components/shared/money-input";
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
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  ReceiptText,
  ShieldCheck,
  Trash2,
  Truck,
  UserRound,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useState,
} from "react";

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type SupplierCreator = {
  id: number;
  name: string;
  email: string | null;
};

type Supplier = {
  id: number;
  code: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  alternate_phone: string | null;
  address: string | null;
  tax_number: string | null;
  payment_terms: string | null;
  credit_limit: number;
  notes: string | null;
  is_active: boolean;
  created_by: SupplierCreator | null;
  created_at: string | null;
  updated_at: string | null;
};

type PaginationLink = {
  url: string | null;
  label: string;
  active: boolean;
};

type PaginatedSuppliers = {
  current_page: number;
  data: Supplier[];
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

type SupplierSummary = {
  total: number;
  active: number;
  inactive: number;
};

type SupplierFilters = {
  search: string;
  status: string;
  sort: string;
};

type SupplierFormData = {
  code: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  alternate_phone: string;
  address: string;
  tax_number: string;
  payment_terms: string;
  credit_limit: string;
  notes: string;
  is_active: boolean;
};

type SupplierPageProps = {
  suppliers: PaginatedSuppliers;
  summary: SupplierSummary;
  filters: SupplierFilters;
};

type SupplierMetricTone = "primary" | "emerald" | "red";

type SupplierDrawerView = "all" | "active" | "inactive";

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
];

const emptySupplierForm: SupplierFormData = {
  code: "",
  name: "",
  contact_person: "",
  email: "",
  phone: "",
  alternate_phone: "",
  address: "",
  tax_number: "",
  payment_terms: "",
  credit_limit: "",
  notes: "",
  is_active: true,
};

const ALL_VALUE = "all";

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function SupplierIndex({
  suppliers,
  summary,
  filters,
}: SupplierPageProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null,
  );

  const [supplierDrawerView, setSupplierDrawerView] =
    useState<SupplierDrawerView | null>(null);

  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const [statusProcessingId, setStatusProcessingId] = useState<number | null>(
    null,
  );

  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null);

  const [deleteProcessing, setDeleteProcessing] = useState(false);

  const [search, setSearch] = useState(filters.search ?? "");

  const [status, setStatus] = useState(filters.status ?? "");

  const [sort, setSort] = useState(filters.sort ?? "latest");

  const form = useForm<SupplierFormData>({
    ...emptySupplierForm,
  });

  useEffect(() => {
    setSearch(filters.search ?? "");
    setStatus(filters.status ?? "");
    setSort(filters.sort ?? "latest");
  }, [filters.search, filters.status, filters.sort]);

  useEffect(() => {
    const normalizedSearch = search.trim();
    const currentSearch = (filters.search ?? "").trim();
    const currentStatus = filters.status ?? "";
    const currentSort = filters.sort ?? "latest";

    if (
      normalizedSearch === currentSearch &&
      status === currentStatus &&
      sort === currentSort
    ) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      router.get(
        "/suppliers",
        {
          search: normalizedSearch || undefined,
          status: status || undefined,
          sort: sort !== "latest" ? sort : undefined,
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
    sort,
    filters.search,
    filters.status,
    filters.sort,
  ]);

  /*
    |--------------------------------------------------------------------------
    | Form dialog
    |--------------------------------------------------------------------------
    */

  function resetSupplierForm(): void {
    form.clearErrors();
    form.setData({
      ...emptySupplierForm,
    });
  }

  function resetAndCloseDialog(): void {
    setIsDialogOpen(false);
    setEditingSupplier(null);
    resetSupplierForm();
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
    setEditingSupplier(null);
    resetSupplierForm();
    setIsDialogOpen(true);
  }

  function openEditDialog(supplier: Supplier): void {
    setEditingSupplier(supplier);
    form.clearErrors();

    form.setData({
      code: supplier.code ?? "",
      name: supplier.name,
      contact_person: supplier.contact_person ?? "",
      email: supplier.email ?? "",
      phone: supplier.phone ?? "",
      alternate_phone: supplier.alternate_phone ?? "",
      address: supplier.address ?? "",
      tax_number: supplier.tax_number ?? "",
      payment_terms: supplier.payment_terms ?? "",
      credit_limit:
        supplier.credit_limit > 0 ? String(supplier.credit_limit) : "",
      notes: supplier.notes ?? "",
      is_active: supplier.is_active,
    });

    setIsDialogOpen(true);
  }

  function submitSupplier(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (editingSupplier) {
      form.put(`/suppliers/${editingSupplier.id}`, {
        preserveScroll: true,
        onSuccess: resetAndCloseDialog,
      });

      return;
    }

    form.post("/suppliers", {
      preserveScroll: true,
      onSuccess: resetAndCloseDialog,
    });
  }

  /*
    |--------------------------------------------------------------------------
    | Filters
    |--------------------------------------------------------------------------
    */

  function openSupplierDetails(supplier: Supplier): void {
    setSelectedSupplier(supplier);
  }

  function closeSupplierDetails(): void {
    setSelectedSupplier(null);
  }

  function openSupplierDrawer(view: SupplierDrawerView): void {
    setSupplierDrawerView(view);
  }

  function closeSupplierDrawer(): void {
    setSupplierDrawerView(null);
  }

  /*
    |--------------------------------------------------------------------------
    | Status and delete
    |--------------------------------------------------------------------------
    */

  function toggleStatus(supplier: Supplier): void {
    if (statusProcessingId === supplier.id) {
      return;
    }

    router.patch(
      `/suppliers/${supplier.id}/status`,
      {
        is_active: !supplier.is_active,
      },
      {
        preserveScroll: true,
        onStart: () => setStatusProcessingId(supplier.id),
        onFinish: () => setStatusProcessingId(null),
      },
    );
  }

  function requestDelete(supplier: Supplier): void {
    setDeleteTarget(supplier);
  }

  function deleteSupplier(): void {
    if (!deleteTarget || deleteProcessing) {
      return;
    }

    router.delete(`/suppliers/${deleteTarget.id}`, {
      preserveScroll: true,
      onStart: () => setDeleteProcessing(true),
      onSuccess: () => setDeleteTarget(null),
      onFinish: () => setDeleteProcessing(false),
    });
  }

  /*
    |--------------------------------------------------------------------------
    | Derived values
    |--------------------------------------------------------------------------
    */

  const operationalPercentage =
    summary.total > 0 ? Math.round((summary.active / summary.total) * 100) : 0;

  const inactivePercentage =
    summary.total > 0 ? Math.max(0, 100 - operationalPercentage) : 0;

  const networkStatusLabel =
    summary.total === 0
      ? "Supplier setup required"
      : summary.active === 0
        ? "Procurement unavailable"
        : summary.inactive === 0
          ? "All suppliers operational"
          : `${summary.inactive} supplier${
              summary.inactive === 1 ? "" : "s"
            } need review`;

  const networkStatusClass =
    summary.total === 0
      ? "border-amber-500/20 bg-amber-500/10 text-amber-300"
      : summary.active === 0
        ? "border-red-500/20 bg-red-500/10 text-red-300"
        : summary.inactive === 0
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
          : "border-amber-500/20 bg-amber-500/10 text-amber-300";

  const networkStatusCode =
    summary.total === 0
      ? "SETUP"
      : summary.active === 0
        ? "BLOCKED"
        : summary.inactive === 0
          ? "READY"
          : "REVIEW";

  /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Supplier Management" />

      <PageContainer className="gap-4 md:gap-5">
        {/* Supplier operations overview */}

        <section className="min-w-0 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.08] via-card/70 to-card/40">
          <div className="flex flex-col gap-3 border-b border-border/60 bg-background/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                <Truck className="size-4" />
              </span>

              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-foreground">
                  Supplier Operations Hub
                </p>

                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  Live supplier availability for purchasing, receiving, and
                  partner maintenance.
                </p>
              </div>
            </div>

            <Badge
              variant="outline"
              className={cn(
                "h-6 w-fit shrink-0 rounded-full px-2.5 text-[9px] font-semibold",
                networkStatusClass,
              )}
            >
              <ShieldCheck className="mr-1 size-3" />
              {networkStatusCode}
              <span className="ml-1 font-normal opacity-80">
                · {networkStatusLabel}
              </span>
            </Badge>
          </div>

          <div className="grid min-w-0 lg:grid-cols-[minmax(330px,1.08fr)_minmax(0,1.92fr)]">
            <button
              type="button"
              onClick={() => openSupplierDrawer("active")}
              className="relative overflow-hidden border-b border-border/60 p-4 text-left transition-colors hover:bg-primary/[0.025] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/35 lg:border-b-0 lg:border-r"
            >
              <div className="pointer-events-none absolute -right-14 -top-16 size-44 rounded-full bg-primary/10 blur-3xl" />
              <Truck className="pointer-events-none absolute -bottom-8 -right-5 size-28 text-primary opacity-[0.025]" />

              <div className="relative grid gap-4 sm:grid-cols-[64px_minmax(0,1fr)] sm:items-center">
                <div className="flex size-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-sm">
                  <Truck className="size-7" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-primary">
                        Operational coverage
                      </p>

                      <p className="mt-2 text-[27px] font-semibold leading-none tracking-[-0.04em]">
                        {summary.active}

                        <span className="mx-1.5 text-base font-medium text-muted-foreground">
                          /
                        </span>

                        {summary.total}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-semibold tabular-nums text-emerald-400">
                        {operationalPercentage}%
                      </p>

                      <p className="mt-1 text-[8px] uppercase tracking-wider text-muted-foreground">
                        Available
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-background/60">
                    <div
                      className="h-full bg-emerald-400 transition-all duration-500"
                      style={{ width: `${operationalPercentage}%` }}
                    />

                    <div
                      className="h-full bg-red-400/80 transition-all duration-500"
                      style={{ width: `${inactivePercentage}%` }}
                    />
                  </div>

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[9px] text-muted-foreground">
                    <span>
                      {summary.active} active supplier
                      {summary.active === 1 ? "" : "s"}
                    </span>

                    <span>
                      {summary.total} registered partner
                      {summary.total === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>
              </div>
            </button>

            <div className="grid min-w-0 sm:grid-cols-3">
              <SupplierNetworkMetric
                title="Registered"
                value={summary.total}
                description="Supplier partner records"
                footerLabel="Operational partners"
                footerValue={`${summary.active}/${summary.total}`}
                progress={operationalPercentage}
                icon={Truck}
                tone="primary"
                onClick={() => openSupplierDrawer("all")}
                className="border-b border-border/60 sm:border-b-0 sm:border-r"
              />

              <SupplierNetworkMetric
                title="Active"
                value={summary.active}
                description="Eligible for PO and receiving"
                footerLabel="Availability rate"
                footerValue={`${operationalPercentage}%`}
                progress={operationalPercentage}
                icon={CheckCircle2}
                tone="emerald"
                onClick={() => openSupplierDrawer("active")}
                className="border-b border-border/60 sm:border-b-0 sm:border-r"
              />

              <SupplierNetworkMetric
                title="Inactive"
                value={summary.inactive}
                description="Restricted from workflows"
                footerLabel="Restriction rate"
                footerValue={`${inactivePercentage}%`}
                progress={inactivePercentage}
                icon={XCircle}
                tone="red"
                onClick={() => openSupplierDrawer("inactive")}
              />
            </div>
          </div>
        </section>

        {/* Supplier directory */}

        <div id="supplier-registry" className="scroll-mt-4">
          <SectionCard
            title="Supplier Registry"
            description="Review essential supplier data at a glance. Click any supplier row to expand the complete record."
            actions={
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="h-7 rounded-full border-amber-500/15 bg-amber-500/[0.06] px-2.5 text-[10px] font-medium text-amber-300"
                >
                  <Truck className="mr-1 size-3" />
                  {suppliers.total} registered
                  {suppliers.total === 1 ? " partner" : " partners"}
                </Badge>

                <Button
                  type="button"
                  onClick={openCreateDialog}
                  className="h-9 rounded-lg px-3.5 text-xs"
                >
                  <Plus className="size-3.5" />
                  Add Supplier
                </Button>
              </div>
            }
          >
            <FilterBar
            onSubmit={(event) => event.preventDefault()}
            contentClassName="grid w-full min-w-0 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_170px_180px]"
          >
              <SearchInput
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onClear={() => setSearch("")}
                placeholder="Search supplier, code, contact, phone, email, or address..."
                className="sm:col-span-2 xl:col-span-1"
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="h-10 w-full text-sm">
                  <SelectValue placeholder="Sort suppliers" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="latest">Latest added</SelectItem>
                  <SelectItem value="oldest">Oldest added</SelectItem>
                  <SelectItem value="name_asc">Name A–Z</SelectItem>
                  <SelectItem value="name_desc">Name Z–A</SelectItem>
                  <SelectItem value="code_asc">Code A–Z</SelectItem>
                  <SelectItem value="code_desc">Code Z–A</SelectItem>
                </SelectContent>
              </Select>
            </FilterBar>

            <SupplierRegistryTable
              suppliers={suppliers.data}
              onSelect={openSupplierDetails}
              onCreate={openCreateDialog}
            />

            <AppPagination pagination={suppliers} itemLabel="suppliers" />
          </SectionCard>
        </div>
      </PageContainer>

      <SupplierOverviewDrawer
        view={supplierDrawerView}
        pagination={suppliers}
        summary={summary}
        onClose={closeSupplierDrawer}
      />

      <SupplierDetailsDrawer
        supplier={selectedSupplier}
        statusProcessingId={statusProcessingId}
        onClose={closeSupplierDetails}
        onEdit={(supplier) => {
          closeSupplierDetails();
          openEditDialog(supplier);
        }}
        onToggleStatus={(supplier) => {
          closeSupplierDetails();
          toggleStatus(supplier);
        }}
        onDelete={(supplier) => {
          closeSupplierDetails();
          requestDelete(supplier);
        }}
      />

      {/* Create and edit supplier */}

      <FormDialog
        open={isDialogOpen}
        onOpenChange={handleDialogOpenChange}
        title={editingSupplier ? "Edit Supplier" : "Add Supplier"}
        description={
          editingSupplier
            ? `Update the procurement profile for ${editingSupplier.name}.`
            : "Register a supplier partner for purchasing and receiving operations."
        }
        onSubmit={submitSupplier}
        processing={form.processing}
        submitText={editingSupplier ? "Save Changes" : "Create Supplier"}
        processingText={
          editingSupplier ? "Saving Changes..." : "Creating Supplier..."
        }
        maxWidth="max-w-4xl"
      >
        <FormSection
          title="Supplier Identity"
          description="Enter the business name, code, contact person, and tax information."
          icon={<Truck />}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              id="name"
              label="Supplier Name"
              error={form.errors.name}
              required
            >
              <Input
                id="name"
                type="text"
                value={form.data.name}
                disabled={form.processing}
                onChange={(event) => form.setData("name", event.target.value)}
                placeholder="ABC Trading"
                autoComplete="organization"
                autoFocus
              />
            </FormField>

            <FormField
              id="code"
              label="Supplier Code"
              description="Leave blank when the system should generate the code."
              error={form.errors.code}
            >
              <Input
                id="code"
                type="text"
                value={form.data.code}
                disabled={form.processing}
                onChange={(event) =>
                  form.setData("code", event.target.value.toUpperCase())
                }
                placeholder="SUP-001"
                className="font-mono uppercase"
                autoComplete="off"
              />
            </FormField>

            <FormField
              id="contact_person"
              label="Contact Person"
              error={form.errors.contact_person}
            >
              <IconInput
                id="contact_person"
                icon={UserRound}
                type="text"
                value={form.data.contact_person}
                disabled={form.processing}
                onChange={(event) =>
                  form.setData("contact_person", event.target.value)
                }
                placeholder="Juan Dela Cruz"
                autoComplete="name"
                iconClassName="group-focus-within:text-primary"
              />
            </FormField>

            <FormField
              id="tax_number"
              label="Tax Number / TIN"
              error={form.errors.tax_number}
            >
              <IconInput
                id="tax_number"
                icon={ReceiptText}
                type="text"
                value={form.data.tax_number}
                disabled={form.processing}
                onChange={(event) =>
                  form.setData("tax_number", event.target.value)
                }
                placeholder="000-000-000-000"
                autoComplete="off"
                iconClassName="group-focus-within:text-primary"
              />
            </FormField>
          </div>
        </FormSection>

        <FormSection
          title="Communication"
          description="Store the primary contact channels and supplier business location."
          icon={<Phone />}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              id="phone"
              label="Primary Phone"
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

            <FormField
              id="alternate_phone"
              label="Alternate Phone"
              description="Optional secondary number."
              error={form.errors.alternate_phone}
            >
              <IconInput
                id="alternate_phone"
                icon={Phone}
                type="text"
                inputMode="tel"
                value={form.data.alternate_phone}
                disabled={form.processing}
                onChange={(event) =>
                  form.setData("alternate_phone", event.target.value)
                }
                placeholder="Optional alternate number"
                autoComplete="tel"
              />
            </FormField>

            <FormField
              id="email"
              label="Email Address"
              error={form.errors.email}
            >
              <IconInput
                id="email"
                icon={Mail}
                type="email"
                value={form.data.email}
                disabled={form.processing}
                onChange={(event) => form.setData("email", event.target.value)}
                placeholder="supplier@example.com"
                autoComplete="email"
                iconClassName="group-focus-within:text-primary"
              />
            </FormField>
          </div>

          <FormField
            id="address"
            label="Business Address"
            error={form.errors.address}
          >
            <Textarea
              id="address"
              rows={3}
              value={form.data.address}
              disabled={form.processing}
              onChange={(event) => form.setData("address", event.target.value)}
              placeholder="Complete supplier business address"
              className="resize-none"
            />
          </FormField>
        </FormSection>

        <FormSection
          title="Commercial Terms"
          description="Set the default purchasing terms, credit allowance, and internal notes."
          icon={<Banknote />}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              id="payment_terms"
              label="Payment Terms"
              error={form.errors.payment_terms}
            >
              <Input
                id="payment_terms"
                type="text"
                list="payment-terms-options"
                value={form.data.payment_terms}
                disabled={form.processing}
                onChange={(event) =>
                  form.setData("payment_terms", event.target.value)
                }
                placeholder="Example: Net 30"
                autoComplete="off"
              />

              <datalist id="payment-terms-options">
                <option value="Cash on Delivery" />
                <option value="Cash Before Delivery" />
                <option value="Net 7" />
                <option value="Net 15" />
                <option value="Net 30" />
                <option value="Net 45" />
                <option value="Net 60" />
              </datalist>
            </FormField>

            <FormField
              id="credit_limit"
              label="Credit Limit"
              error={form.errors.credit_limit}
            >
              <MoneyInput
                id="credit_limit"
                value={form.data.credit_limit}
                disabled={form.processing}
                onValueChange={(value) => form.setData("credit_limit", value)}
                placeholder="0.00"
              />
            </FormField>
          </div>

          <FormField
            id="notes"
            label="Notes"
            description="Optional delivery instructions, commercial notes, or internal remarks."
            error={form.errors.notes}
          >
            <Textarea
              id="notes"
              rows={4}
              value={form.data.notes}
              disabled={form.processing}
              onChange={(event) => form.setData("notes", event.target.value)}
              placeholder="Additional supplier information or delivery instructions"
              className="resize-none"
            />
          </FormField>
        </FormSection>

        <FormSection
          title="Procurement Availability"
          description="Control whether this supplier can be selected in purchasing workflows."
          icon={<ShieldCheck />}
        >
          <BooleanField
            id="is_active"
            checked={form.data.is_active}
            disabled={form.processing}
            onCheckedChange={(checked) => form.setData("is_active", checked)}
            label="Active Supplier"
            description="Active suppliers can be selected in purchase orders and receiving transactions."
            error={form.errors.is_active}
            className="border-emerald-500/15 bg-emerald-500/[0.035]"
          />
        </FormSection>
      </FormDialog>

      {/* Delete supplier */}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !deleteProcessing) {
            setDeleteTarget(null);
          }
        }}
        title="Delete Supplier"
        description={`Are you sure you want to delete "${deleteTarget?.name ?? "this supplier"}"? The system may prevent deletion when the supplier is linked to purchasing records.`}
        confirmText="Delete Supplier"
        processing={deleteProcessing}
        destructive
        onConfirm={deleteSupplier}
      />
    </AppLayout>
  );
}

/*
|--------------------------------------------------------------------------
| Supplier registry table
|--------------------------------------------------------------------------
*/

type SupplierRegistryTableProps = {
  suppliers: Supplier[];
  onSelect: (supplier: Supplier) => void;
  onCreate: () => void;
};

function SupplierRegistryTable({
  suppliers,
  onSelect,
  onCreate,
}: SupplierRegistryTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-background/20 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse table-fixed">
          <thead className="border-b border-primary/10 bg-primary/[0.025]">
            <tr>
              <th className="w-[280px] px-4 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                Supplier
              </th>
              <th className="w-[210px] px-4 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                Primary Contact
              </th>
              <th className="w-[210px] px-4 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                Commercial Terms
              </th>
              <th className="w-[145px] px-4 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                Status
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border/60">
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-14">
                  <div className="mx-auto flex max-w-sm flex-col items-center text-center">
                    <span className="flex size-11 items-center justify-center rounded-xl border border-primary/15 bg-primary/[0.045] text-primary">
                      <Truck className="size-5" />
                    </span>
                    <h3 className="mt-3 text-sm font-semibold">
                      No suppliers found
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Adjust the filters or register your first supplier partner.
                    </p>
                    <Button
                      type="button"
                      onClick={onCreate}
                      className="mt-4 h-9 rounded-lg px-4 text-xs"
                    >
                      <Plus className="size-4" />
                      Add Supplier
                    </Button>
                  </div>
                </td>
              </tr>
            ) : (
              suppliers.map((supplier) => (
                <tr
                  key={supplier.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open ${supplier.name} supplier record`}
                  onClick={() => onSelect(supplier)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelect(supplier);
                    }
                  }}
                  className="group cursor-pointer bg-card/55 transition-colors hover:bg-primary/[0.035] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/35"
                >
                  <td className="px-4 py-3">
                    <EntityInfo
                      avatar={
                        <EntityAvatar
                          icon={Truck}
                          className="border-primary/15 bg-primary/[0.07] text-primary transition-colors group-hover:border-primary/25 group-hover:bg-primary/10"
                        />
                      }
                      title={supplier.name}
                      badges={
                        <Badge
                          variant="outline"
                          className="h-5 rounded-full border-amber-500/15 bg-amber-500/[0.055] px-2 font-mono text-[8px] text-amber-300"
                        >
                          {supplier.code}
                        </Badge>
                      }
                      subtitle={
                        supplier.address
                          ? supplier.address
                          : "No business address"
                      }
                    />
                  </td>

                  <td className="px-4 py-3">
                    <p className="truncate text-[11px] font-semibold text-foreground/90">
                      {supplier.contact_person ?? "Not provided"}
                    </p>
                    <p className="mt-1 truncate text-[9px] text-muted-foreground">
                      {supplier.phone ?? supplier.email ?? "No contact channel"}
                    </p>
                  </td>

                  <td className="px-4 py-3">
                    <p className="truncate text-[11px] font-semibold text-foreground/90">
                      {supplier.payment_terms ?? "Not configured"}
                    </p>
                    <p className="mt-1 text-[9px] font-medium tabular-nums text-primary">
                      {formatCurrency(supplier.credit_limit)} credit limit
                    </p>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <StatusBadge
                        label={supplier.is_active ? "Active" : "Inactive"}
                        variant={supplier.is_active ? "success" : "danger"}
                      />
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
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

function SupplierOverviewDrawer({
  view,
  pagination,
  summary,
  onClose,
}: {
  view: SupplierDrawerView | null;
  pagination: PaginatedSuppliers;
  summary: SupplierSummary;
  onClose: () => void;
}) {
  const [drawerSearch, setDrawerSearch] = useState("");
  const [expandedSupplierId, setExpandedSupplierId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    setDrawerSearch("");
    setExpandedSupplierId(null);
  }, [view]);

  const activeView = view ?? "all";

  const config = {
    all: {
      title: "Registered Suppliers",
      description:
        "Review supplier partners loaded on the current page. Select a supplier to expand its procurement profile.",
      total: summary.total,
    },
    active: {
      title: "Active Suppliers",
      description:
        "Active suppliers are eligible for purchase orders and receiving workflows. Select a supplier to inspect its profile.",
      total: summary.active,
    },
    inactive: {
      title: "Inactive Suppliers",
      description:
        "Inactive suppliers remain on record but are restricted from procurement workflows. Select a supplier to inspect its profile.",
      total: summary.inactive,
    },
  }[activeView];

  const normalizedSearch = drawerSearch.trim().toLowerCase();

  const matchingSuppliers = pagination.data.filter((supplier) => {
    if (activeView === "active") return supplier.is_active;
    if (activeView === "inactive") return !supplier.is_active;
    return true;
  });

  const visibleSuppliers = normalizedSearch
    ? matchingSuppliers.filter((supplier) =>
        [
          supplier.name,
          supplier.code,
          supplier.contact_person,
          supplier.phone,
          supplier.email,
          supplier.address,
          supplier.payment_terms,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch),
      )
    : matchingSuppliers;

  function toggleSupplierAccordion(supplierId: number): void {
    setExpandedSupplierId((currentId) =>
      currentId === supplierId ? null : supplierId,
    );
  }

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
                Matching supplier records
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

        <div className="border-b border-border/60 p-4">
          <SearchInput
            value={drawerSearch}
            onChange={(event) => setDrawerSearch(event.target.value)}
            onClear={() => setDrawerSearch("")}
            placeholder="Search loaded suppliers..."
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {visibleSuppliers.length === 0 ? (
            <div className="flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-background/20 p-6 text-center">
              <Truck className="size-6 text-muted-foreground" />
              <p className="mt-3 text-sm font-semibold">No loaded matches</p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Change the search or open another overview segment.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {visibleSuppliers.map((supplier) => {
                const expanded = expandedSupplierId === supplier.id;

                return (
                  <section
                    key={supplier.id}
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
                      aria-controls={`supplier-overview-${supplier.id}`}
                      onClick={() => toggleSupplierAccordion(supplier.id)}
                      className="flex w-full items-center gap-3 p-3 text-left transition hover:bg-primary/[0.035] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/35"
                    >
                      <EntityAvatar
                        icon={Truck}
                        className={cn(
                          "border-primary/15 bg-primary/[0.07] text-primary transition-colors",
                          expanded && "border-primary/25 bg-primary/10",
                        )}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="truncate text-[11px] font-semibold">
                            {supplier.name}
                          </p>

                          <StatusBadge
                            label={supplier.is_active ? "Active" : "Inactive"}
                            variant={supplier.is_active ? "success" : "danger"}
                          />
                        </div>

                        <p className="mt-1 truncate font-mono text-[9px] text-muted-foreground">
                          {supplier.code} ·{" "}
                          {supplier.contact_person ?? "No contact person"}
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
                        id={`supplier-overview-${supplier.id}`}
                        className="border-t border-border/60 bg-card/20"
                      >
                        <div className="grid gap-2 p-3 sm:grid-cols-2">
                          <SupplierAccordionMetric
                            label="Contact person"
                            value={supplier.contact_person ?? "Not provided"}
                            icon={UserRound}
                          />

                          <SupplierAccordionMetric
                            label="Primary phone"
                            value={supplier.phone ?? "Not provided"}
                            icon={Phone}
                          />

                          <SupplierAccordionMetric
                            label="Email address"
                            value={supplier.email ?? "Not provided"}
                            icon={Mail}
                          />

                          <SupplierAccordionMetric
                            label="Payment terms"
                            value={supplier.payment_terms ?? "Not configured"}
                            icon={ReceiptText}
                          />

                          <SupplierAccordionMetric
                            label="Credit limit"
                            value={formatCurrency(supplier.credit_limit)}
                            icon={CircleDollarSign}
                            valueClassName="font-semibold tabular-nums text-primary"
                          />

                          <SupplierAccordionMetric
                            label="Tax number / TIN"
                            value={supplier.tax_number ?? "Not provided"}
                            icon={ReceiptText}
                            valueClassName="font-mono"
                          />
                        </div>

                        <div className="space-y-2 border-t border-border/50 p-3">
                          <SupplierAccordionTextBlock
                            label="Business address"
                            value={supplier.address ?? "No business address recorded"}
                            icon={MapPin}
                          />

                          <SupplierAccordionTextBlock
                            label="Internal notes"
                            value={supplier.notes ?? "No internal notes"}
                            icon={ReceiptText}
                          />
                        </div>

                        <div className="grid gap-2 border-t border-border/50 bg-background/20 p-3 sm:grid-cols-2">
                          <SupplierAccordionMetric
                            label="Added by"
                            value={
                              supplier.created_by
                                ? supplier.created_by.name
                                : "Creator not recorded"
                            }
                            icon={UserRound}
                          />

                          <SupplierAccordionMetric
                            label="Last updated"
                            value={formatDateTime(supplier.updated_at)}
                            icon={CalendarDays}
                          />
                        </div>
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppDrawer>
  );
}

function SupplierAccordionMetric({
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

function SupplierAccordionTextBlock({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-lg border border-border/50 bg-background/25 p-3">
      <div className="flex items-center gap-2">
        <Icon className="size-3.5 text-primary" />
        <p className="text-[8px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">
          {label}
        </p>
      </div>

      <p className="mt-2 whitespace-pre-wrap break-words text-[10px] leading-5 text-foreground/80">
        {value}
      </p>
    </div>
  );
}

function SupplierDetailsDrawer({
  supplier,
  statusProcessingId,
  onClose,
  onEdit,
  onToggleStatus,
  onDelete,
}: {
  supplier: Supplier | null;
  statusProcessingId: number | null;
  onClose: () => void;
  onEdit: (supplier: Supplier) => void;
  onToggleStatus: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
}) {
  return (
    <AppDrawer
      open={supplier !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title="Supplier Record"
      description="Review contact channels, commercial terms, procurement availability, and record history."
      processing={false}
    >
      {supplier && (
        <div className="flex min-h-full flex-col bg-card">
          <div className="min-h-0 flex-1 overflow-y-auto">
            <section className="border-b border-primary/10 bg-gradient-to-br from-primary/[0.055] via-primary/[0.012] to-transparent px-5 py-5">
              <div className="flex items-start gap-3">
                <EntityAvatar
                  icon={Truck}
                  className="size-11 border-primary/20 bg-primary/[0.08] text-primary"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-primary">
                      Procurement supplier
                    </p>
                    <StatusBadge
                      label={supplier.is_active ? "Active" : "Inactive"}
                      variant={supplier.is_active ? "success" : "danger"}
                    />
                  </div>
                  <h2 className="mt-2 text-lg font-semibold tracking-[-0.025em]">
                    {supplier.name}
                  </h2>
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                    {supplier.code}
                  </p>
                </div>
              </div>
            </section>

            <div className="space-y-3 p-4">
              <SupplierDetailSection
                title="Communication"
                description="Contact channels for supplier coordination."
                icon={Phone}
                iconClassName="border-primary/20 bg-primary/10 text-primary"
              >
                <SupplierDetailItem
                  label="Contact person"
                  value={supplier.contact_person ?? "Not provided"}
                  icon={UserRound}
                />
                <SupplierDetailItem
                  label="Primary phone"
                  value={supplier.phone ?? "Not provided"}
                  icon={Phone}
                />
                <SupplierDetailItem
                  label="Alternate phone"
                  value={supplier.alternate_phone ?? "Not provided"}
                  icon={Phone}
                />
                <SupplierDetailItem
                  label="Email address"
                  value={supplier.email ?? "Not provided"}
                  icon={Mail}
                />
              </SupplierDetailSection>

              <SupplierDetailSection
                title="Business Profile"
                description="Registered address and tax identity."
                icon={MapPin}
                iconClassName="border-primary/20 bg-primary/10 text-primary"
              >
                <SupplierDetailItem
                  label="Business address"
                  value={supplier.address ?? "Not provided"}
                  icon={MapPin}
                  multiline
                />
                <SupplierDetailItem
                  label="Tax number / TIN"
                  value={supplier.tax_number ?? "Not provided"}
                  icon={ReceiptText}
                  mono
                />
              </SupplierDetailSection>

              <SupplierDetailSection
                title="Commercial Terms"
                description="Payment, credit, ownership, and internal notes."
                icon={Banknote}
                iconClassName="border-primary/20 bg-primary/10 text-primary"
              >
                <SupplierDetailItem
                  label="Payment terms"
                  value={supplier.payment_terms ?? "Not configured"}
                  icon={ReceiptText}
                />
                <SupplierDetailItem
                  label="Credit limit"
                  value={formatCurrency(supplier.credit_limit)}
                  icon={CircleDollarSign}
                  valueClassName="font-semibold tabular-nums text-primary"
                />
                <SupplierDetailItem
                  label="Added by"
                  value={
                    supplier.created_by
                      ? `${supplier.created_by.name}${supplier.created_by.email ? ` · ${supplier.created_by.email}` : ""}`
                      : "Creator not recorded"
                  }
                  icon={UserRound}
                />
                <SupplierDetailItem
                  label="Created"
                  value={formatDateTime(supplier.created_at)}
                  icon={CalendarDays}
                />
                <SupplierDetailItem
                  label="Last updated"
                  value={formatDateTime(supplier.updated_at)}
                  icon={CalendarDays}
                />
                <SupplierDetailItem
                  label="Notes"
                  value={supplier.notes ?? "No internal notes"}
                  icon={ReceiptText}
                  multiline
                />
              </SupplierDetailSection>
            </div>
          </div>

          <div className="grid gap-2 border-t border-border/60 bg-background/30 p-4 sm:grid-cols-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onEdit(supplier)}
              className="h-9"
            >
              <Pencil className="size-3.5" />
              Edit
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={statusProcessingId === supplier.id}
              onClick={() => onToggleStatus(supplier)}
              className="h-9"
            >
              {supplier.is_active ? (
                <XCircle className="size-3.5" />
              ) : (
                <CheckCircle2 className="size-3.5" />
              )}
              {supplier.is_active ? "Deactivate" : "Activate"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onDelete(supplier)}
              className="h-9 border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
            >
              <Trash2 className="size-3.5" />
              Delete
            </Button>
          </div>
        </div>
      )}
    </AppDrawer>
  );
}

function SupplierDetailSection({
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

function SupplierDetailItem({
  label,
  value,
  icon: Icon,
  mono = false,
  multiline = false,
  valueClassName,
}: {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  mono?: boolean;
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
            mono && "font-mono",
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

/*
|--------------------------------------------------------------------------
| Supplier overview helpers
|--------------------------------------------------------------------------
*/

function SupplierNetworkMetric({
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
  tone: SupplierMetricTone;
  onClick: () => void;
  className?: string;
}) {
  const toneStyles: Record<
    SupplierMetricTone,
    {
      icon: string;
      value: string;
      glow: string;
      bar: string;
      footer: string;
    }
  > = {
    primary: {
      icon: "border-primary/20 bg-primary/10 text-primary",
      value: "text-primary",
      glow: "bg-primary/10",
      bar: "bg-primary",
      footer: "text-primary",
    },
    emerald: {
      icon: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
      value: "text-emerald-400",
      glow: "bg-emerald-500/10",
      bar: "bg-emerald-400",
      footer: "text-emerald-300",
    },
    red: {
      icon: "border-red-500/20 bg-red-500/10 text-red-400",
      value: "text-red-400",
      glow: "bg-red-500/10",
      bar: "bg-red-400",
      footer: "text-red-300",
    },
  };

  const styles = toneStyles[tone];
  const normalizedProgress = Math.min(100, Math.max(0, progress));

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex min-h-[118px] min-w-0 flex-col overflow-hidden px-4 py-3.5 text-left transition-colors hover:bg-primary/[0.025] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/35",
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
    </button>
  );
}

/*
|--------------------------------------------------------------------------
| Formatting
|--------------------------------------------------------------------------
*/

function formatNumber(value: number | string | null): string {
  const numericValue = Number(value ?? 0);

  return new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(numericValue) ? numericValue : 0);
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
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Manila",
  }).format(date);
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