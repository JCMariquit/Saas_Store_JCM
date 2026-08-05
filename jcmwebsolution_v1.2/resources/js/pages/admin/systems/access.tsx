import { SectionCard } from '@/components/admin-ui/section-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Ban,
    Boxes,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock3,
    KeyRound,
    Mail,
    RefreshCw,
    RotateCcw,
    Search,
    ShieldCheck,
    UserRound,
    Users,
    X,
} from 'lucide-react';
import {
    useEffect,
    useMemo,
    useState,
    type FormEvent,
    type ReactNode,
} from 'react';

type Row = {
    id: number;
    product_id: number;
    product_user_type_id: number;
    status: string;
    user_name: string;
    user_email: string;
    owner_name: string;
    product_name: string;
    role_name: string;
    subscription_status?: string | null;
};

type Role = {
    id: number;
    product_id: number;
    name: string;
};

type Product = {
    id: number;
    name: string;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Props = {
    access: {
        data: Row[];
        links: PaginationLink[];
    };
    roles: Role[];
    products: Product[];
    filters: {
        search?: string;
        product_id?: number | null;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Systems Management',
        href: '/admin/systems',
    },
    {
        title: 'System Access',
        href: '/admin/systems/access',
    },
];

const selectClassName =
    'h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary/60 focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60';

export default function SystemAccess({
    access,
    roles,
    products,
    filters,
}: Props) {
    const [selectedAccess, setSelectedAccess] = useState<Row | null>(
        null,
    );

    const filterForm = useForm({
        search: filters.search ?? '',
        product_id: String(filters.product_id ?? ''),
    });

    const sortedProducts = useMemo(
        () =>
            [...products].sort((first, second) =>
                first.name.localeCompare(second.name),
            ),
        [products],
    );

    const stats = useMemo(() => {
        const total = access.data.length;

        const active = access.data.filter(
            (row) => row.status.toLowerCase() === 'active',
        ).length;

        const pending = access.data.filter(
            (row) => row.status.toLowerCase() === 'pending',
        ).length;

        const restricted = access.data.filter((row) =>
            ['inactive', 'removed'].includes(row.status.toLowerCase()),
        ).length;

        return {
            total,
            active,
            pending,
            restricted,
        };
    }, [access.data]);

    const hasFilters =
        filterForm.data.search.trim() !== '' ||
        filterForm.data.product_id !== '';

    const submitFilters = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.get(
            '/admin/systems/access',
            {
                search: filterForm.data.search || undefined,
                product_id:
                    filterForm.data.product_id || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const clearFilters = () => {
        filterForm.setData({
            search: '',
            product_id: '',
        });

        router.get(
            '/admin/systems/access',
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="System Access" />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            System Access
                        </h1>

                        <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
                            Review product assignments and control the
                            role and access state of every connected
                            account.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <ShieldCheck className="size-4" />
                        </span>

                        <div>
                            <p className="font-semibold text-foreground">
                                Canonical access control
                            </p>

                            <p className="mt-0.5 text-[10px]">
                                Product role and account access
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        icon={<Users className="size-5" />}
                        label="Records on this page"
                        value={stats.total}
                        description="Displayed assignments"
                    />

                    <StatCard
                        icon={<CheckCircle2 className="size-5" />}
                        label="Active access"
                        value={stats.active}
                        description="Allowed to enter"
                        tone="success"
                    />

                    <StatCard
                        icon={<Clock3 className="size-5" />}
                        label="Pending access"
                        value={stats.pending}
                        description="Waiting for activation"
                        tone="warning"
                    />

                    <StatCard
                        icon={<Ban className="size-5" />}
                        label="Restricted access"
                        value={stats.restricted}
                        description="Inactive or removed"
                        tone="danger"
                    />
                </div>

                <SectionCard
                    title="Access directory"
                    description="Use the filters to locate an assignment, then click its row to review or update access."
                    actions={
                        <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
                            {access.data.length.toLocaleString()} record
                            {access.data.length === 1 ? '' : 's'}
                        </span>
                    }
                >
                    <div>
                        <form
                            onSubmit={submitFilters}
                            className="grid gap-3 border-y border-border/60 py-4 lg:grid-cols-[minmax(0,1fr)_260px_auto]"
                        >
                            <div className="relative">
                                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

                                <Input
                                    className="h-10 rounded-xl pl-10"
                                    placeholder="Search account name or email..."
                                    value={filterForm.data.search}
                                    onChange={(event) =>
                                        filterForm.setData(
                                            'search',
                                            event.target.value,
                                        )
                                    }
                                />
                            </div>

                            <select
                                className={selectClassName}
                                value={filterForm.data.product_id}
                                onChange={(event) =>
                                    filterForm.setData(
                                        'product_id',
                                        event.target.value,
                                    )
                                }
                            >
                                <option value="">All JCM systems</option>

                                {sortedProducts.map((product) => (
                                    <option
                                        key={product.id}
                                        value={product.id}
                                    >
                                        {product.name}
                                    </option>
                                ))}
                            </select>

                            <div className="flex gap-2">
                                <Button
                                    type="submit"
                                    className="h-10 flex-1 rounded-xl lg:flex-none"
                                >
                                    <Search className="size-4" />
                                    Apply filters
                                </Button>

                                {hasFilters && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-10 rounded-xl"
                                        onClick={clearFilters}
                                        aria-label="Clear filters"
                                        title="Clear filters"
                                    >
                                        <RotateCcw className="size-4" />
                                    </Button>
                                )}
                            </div>
                        </form>

                        <div className="pt-2">
                            {access.data.length === 0 ? (
                                <EmptyState
                                    hasFilters={hasFilters}
                                    onClear={clearFilters}
                                />
                            ) : (
                                <>
                                    <AccessTable
                                        rows={access.data}
                                        onSelect={setSelectedAccess}
                                    />

                                    <Pagination
                                        links={access.links}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </SectionCard>
            </div>

            {selectedAccess && (
                <AccessDetailsDrawer
                    row={selectedAccess}
                    roles={roles
                        .filter(
                            (role) =>
                                role.product_id ===
                                selectedAccess.product_id,
                        )
                        .sort((first, second) =>
                            first.name.localeCompare(second.name),
                        )}
                    onClose={() => setSelectedAccess(null)}
                />
            )}
        </AppLayout>
    );
}

function AccessTable({
    rows,
    onSelect,
}: {
    rows: Row[];
    onSelect: (row: Row) => void;
}) {
    return (
        <div>
            <div className="hidden grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_135px_135px_110px_24px] items-center gap-4 border-b border-border/70 px-1 py-2.5 lg:grid">
                <TableHeading>Account</TableHeading>
                <TableHeading>System assignment</TableHeading>
                <TableHeading>Subscription</TableHeading>
                <TableHeading>Product role</TableHeading>
                <TableHeading>Access</TableHeading>
                <span />
            </div>

            <div className="divide-y divide-border/60">
                {rows.map((row) => (
                    <button
                        key={row.id}
                        type="button"
                        className="grid w-full grid-cols-[minmax(0,1fr)_24px] items-center gap-4 px-1 py-3.5 text-left transition hover:bg-muted/20 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_135px_135px_110px_24px]"
                        onClick={() => onSelect(row)}
                    >
                        <AccountIdentity row={row} />

                        <div className="hidden min-w-0 lg:block">
                            <div className="flex items-center gap-3">
                                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Boxes className="size-4" />
                                </span>

                                <div className="min-w-0">
                                    <p className="truncate text-xs font-semibold text-foreground">
                                        {row.product_name}
                                    </p>

                                    <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                                        Owner: {row.owner_name}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="hidden lg:block">
                            <StatusBadge
                                status={
                                    row.subscription_status ?? 'none'
                                }
                                kind="subscription"
                            />
                        </div>

                        <p className="hidden truncate text-xs font-medium text-foreground lg:block">
                            {row.role_name || 'Not assigned'}
                        </p>

                        <div className="hidden lg:block">
                            <StatusBadge
                                status={row.status}
                                kind="access"
                            />
                        </div>

                        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                    </button>
                ))}
            </div>
        </div>
    );
}

function AccessDetailsDrawer({
    row,
    roles,
    onClose,
}: {
    row: Row;
    roles: Role[];
    onClose: () => void;
}) {
    const form = useForm({
        product_user_type_id: String(
            row.product_user_type_id,
        ),
        status: row.status,
    });

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener(
                'keydown',
                handleEscape,
            );
            document.body.style.overflow = '';
        };
    }, [onClose]);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.put(`/admin/systems/access/${row.id}`, {
            preserveScroll: true,
            onSuccess: onClose,
        });
    };

    const noRoles = roles.length === 0;

    return (
        <div className="fixed inset-0 z-50">
            <button
                type="button"
                className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
                onClick={onClose}
                aria-label="Close drawer"
            />

            <aside className="absolute top-0 right-0 flex h-full w-full max-w-xl flex-col border-l border-border bg-background shadow-2xl">
                <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
                    <div className="min-w-0">
                        <h2 className="truncate text-lg font-semibold text-foreground">
                            {row.user_name}
                        </h2>

                        <p className="mt-1 truncate text-xs text-muted-foreground">
                            {row.user_email}
                        </p>
                    </div>

                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="shrink-0 rounded-xl"
                        onClick={onClose}
                        aria-label="Close drawer"
                    >
                        <X className="size-4" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge
                                status={row.status}
                                kind="access"
                            />

                            <StatusBadge
                                status={
                                    row.subscription_status ?? 'none'
                                }
                                kind="subscription"
                            />
                        </div>

                        <DetailSection title="Account">
                            <DetailRow
                                label="User"
                                value={row.user_name}
                            />

                            <DetailRow
                                label="Email"
                                value={row.user_email}
                            />

                            <DetailRow
                                label="Account owner"
                                value={
                                    row.owner_name ||
                                    'No account owner'
                                }
                            />
                        </DetailSection>

                        <DetailSection title="System assignment">
                            <DetailRow
                                label="JCM system"
                                value={row.product_name}
                            />

                            <DetailRow
                                label="Current role"
                                value={
                                    row.role_name ||
                                    'Not assigned'
                                }
                            />

                            <DetailRow
                                label="Subscription"
                                value={formatLabel(
                                    row.subscription_status ??
                                        'none',
                                )}
                            />
                        </DetailSection>

                        <DetailSection title="Access configuration">
                            <div className="space-y-4">
                                <Field label="Product role" required>
                                    <select
                                        className={selectClassName}
                                        value={
                                            form.data
                                                .product_user_type_id
                                        }
                                        onChange={(event) =>
                                            form.setData(
                                                'product_user_type_id',
                                                event.target.value,
                                            )
                                        }
                                        disabled={
                                            noRoles ||
                                            form.processing
                                        }
                                    >
                                        {noRoles ? (
                                            <option value="">
                                                No roles configured
                                            </option>
                                        ) : (
                                            roles.map((role) => (
                                                <option
                                                    key={role.id}
                                                    value={role.id}
                                                >
                                                    {role.name}
                                                </option>
                                            ))
                                        )}
                                    </select>

                                    {form.errors
                                        .product_user_type_id && (
                                        <p className="text-[10px] text-destructive">
                                            {
                                                form.errors
                                                    .product_user_type_id
                                            }
                                        </p>
                                    )}
                                </Field>

                                <Field label="Access status" required>
                                    <select
                                        className={selectClassName}
                                        value={form.data.status}
                                        onChange={(event) =>
                                            form.setData(
                                                'status',
                                                event.target.value,
                                            )
                                        }
                                        disabled={form.processing}
                                    >
                                        <option value="active">
                                            Active
                                        </option>
                                        <option value="pending">
                                            Pending
                                        </option>
                                        <option value="inactive">
                                            Inactive
                                        </option>
                                        <option value="removed">
                                            Removed
                                        </option>
                                    </select>

                                    {form.errors.status && (
                                        <p className="text-[10px] text-destructive">
                                            {form.errors.status}
                                        </p>
                                    )}
                                </Field>
                            </div>
                        </DetailSection>

                        <AccessStatusNotice
                            status={form.data.status}
                        />

                        <div className="flex items-center justify-end gap-2 border-t border-border pt-5">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={form.processing}
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                disabled={
                                    form.processing || noRoles
                                }
                            >
                                {form.processing ? (
                                    <>
                                        <RefreshCw className="size-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <KeyRound className="size-4" />
                                        Save access
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </aside>
        </div>
    );
}

function AccessStatusNotice({ status }: { status: string }) {
    const normalized = status.toLowerCase();

    const description =
        normalized === 'active'
            ? 'The user can enter the assigned JCM system when the linked subscription is also usable.'
            : normalized === 'pending'
              ? 'The assignment exists but access remains unavailable until it is activated.'
              : normalized === 'inactive'
                ? 'The assignment is retained, but the user cannot enter the system.'
                : 'The assignment is marked as removed and should no longer grant product access.';

    return (
        <div className="border-l-2 border-primary pl-3">
            <p className="text-xs font-semibold text-foreground">
                {formatLabel(status)} access
            </p>

            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {description}
            </p>
        </div>
    );
}

function AccountIdentity({ row }: { row: Row }) {
    return (
        <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <UserRound className="size-4" />
            </span>

            <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                    {row.user_name}
                </p>

                <div className="mt-1 flex min-w-0 items-center gap-1.5 text-[10px] text-muted-foreground">
                    <Mail className="size-3 shrink-0" />

                    <span className="truncate">
                        {row.user_email}
                    </span>
                </div>

                <div className="mt-1 flex flex-wrap gap-1.5 lg:hidden">
                    <span className="truncate text-[9px] text-muted-foreground">
                        {row.product_name}
                    </span>

                    <span className="text-[9px] text-muted-foreground">
                        ·
                    </span>

                    <StatusBadge
                        status={row.status}
                        kind="access"
                    />
                </div>
            </div>
        </div>
    );
}

function StatusBadge({
    status,
    kind,
}: {
    status: string;
    kind: 'access' | 'subscription';
}) {
    const normalized = status.toLowerCase();

    const className =
        normalized === 'active'
            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
            : normalized === 'trial'
              ? 'border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-400'
              : normalized === 'pending'
                ? 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400'
                : normalized === 'inactive' ||
                    normalized === 'none'
                  ? 'border-border bg-muted text-muted-foreground'
                  : 'border-destructive/20 bg-destructive/10 text-destructive';

    return (
        <span
            className={`inline-flex shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-bold tracking-[0.08em] uppercase ${className}`}
            title={
                kind === 'subscription'
                    ? 'Subscription status'
                    : 'Access status'
            }
        >
            {formatLabel(status)}
        </span>
    );
}

function StatCard({
    icon,
    label,
    value,
    description,
    tone = 'default',
}: {
    icon: ReactNode;
    label: string;
    value: number;
    description: string;
    tone?: 'default' | 'success' | 'warning' | 'danger';
}) {
    const iconClassName =
        tone === 'success'
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            : tone === 'warning'
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
              : tone === 'danger'
                ? 'bg-destructive/10 text-destructive'
                : 'bg-primary/10 text-primary';

    return (
        <div className="rounded-2xl border border-border/70 bg-background p-4">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-[10px] font-semibold tracking-[0.13em] text-muted-foreground uppercase">
                        {label}
                    </p>

                    <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                        {value.toLocaleString()}
                    </p>

                    <p className="mt-1 text-[11px] text-muted-foreground">
                        {description}
                    </p>
                </div>

                <span
                    className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}
                >
                    {icon}
                </span>
            </div>
        </div>
    );
}

function EmptyState({
    hasFilters,
    onClear,
}: {
    hasFilters: boolean;
    onClear: () => void;
}) {
    return (
        <div className="flex min-h-64 flex-col items-center justify-center border-y border-dashed border-border px-6 py-12 text-center">
            <span className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <KeyRound className="size-5" />
            </span>

            <p className="mt-4 text-sm font-semibold text-foreground">
                {hasFilters
                    ? 'No matching access records'
                    : 'No system access assignments yet'}
            </p>

            <p className="mt-1 max-w-md text-xs leading-5 text-muted-foreground">
                {hasFilters
                    ? 'Change or clear the filters to search for another account.'
                    : 'Access assignments will appear after a user is connected to a JCM system.'}
            </p>

            {hasFilters && (
                <Button
                    type="button"
                    variant="outline"
                    className="mt-5 rounded-xl"
                    onClick={onClear}
                >
                    <RotateCcw className="size-4" />
                    Clear filters
                </Button>
            )}
        </div>
    );
}

function Pagination({ links }: { links: PaginationLink[] }) {
    if (links.length <= 3) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center justify-center gap-1.5 border-t border-border/60 pt-5">
            {links.map((link, index) => {
                const previous =
                    link.label.includes('Previous') ||
                    link.label.includes('&laquo;');

                const next =
                    link.label.includes('Next') ||
                    link.label.includes('&raquo;');

                return (
                    <button
                        key={`${link.label}-${index}`}
                        type="button"
                        disabled={!link.url}
                        onClick={() => {
                            if (!link.url) {
                                return;
                            }

                            router.get(
                                link.url,
                                {},
                                {
                                    preserveState: true,
                                    preserveScroll: true,
                                },
                            );
                        }}
                        className={[
                            'flex h-9 min-w-9 items-center justify-center rounded-xl border px-3 text-xs font-medium transition',
                            link.active
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground',
                            !link.url
                                ? 'cursor-not-allowed opacity-40'
                                : '',
                        ].join(' ')}
                    >
                        {previous ? (
                            <ChevronLeft className="size-4" />
                        ) : next ? (
                            <ChevronRight className="size-4" />
                        ) : (
                            cleanPaginationLabel(link.label)
                        )}
                    </button>
                );
            })}
        </div>
    );
}

function Field({
    label,
    children,
    required = false,
}: {
    label: string;
    children: ReactNode;
    required?: boolean;
}) {
    return (
        <div className="space-y-2">
            <Label className="text-xs font-medium text-foreground">
                {label}

                {required && (
                    <span className="ml-1 text-destructive">*</span>
                )}
            </Label>

            {children}
        </div>
    );
}

function DetailSection({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <section>
            <h3 className="mb-3 text-[10px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
                {title}
            </h3>

            {children}
        </section>
    );
}

function DetailRow({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start justify-between gap-4 border-b border-border/60 py-3 first:pt-0 last:border-b-0 last:pb-0">
            <span className="text-xs text-muted-foreground">
                {label}
            </span>

            <span className="max-w-[65%] break-words text-right text-xs font-semibold text-foreground">
                {value}
            </span>
        </div>
    );
}

function TableHeading({ children }: { children: ReactNode }) {
    return (
        <span className="text-[9px] font-semibold tracking-[0.13em] text-muted-foreground uppercase">
            {children}
        </span>
    );
}

function formatLabel(value?: string | null) {
    if (!value) {
        return 'None';
    }

    return value
        .replace(/[_-]+/g, ' ')
        .replace(/\b\w/g, (character) =>
            character.toUpperCase(),
        );
}

function cleanPaginationLabel(label: string) {
    return label
        .replace('&laquo;', '')
        .replace('&raquo;', '')
        .replace('Previous', '')
        .replace('Next', '')
        .trim();
}