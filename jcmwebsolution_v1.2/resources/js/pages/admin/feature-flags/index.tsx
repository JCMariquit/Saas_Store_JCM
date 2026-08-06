import {
    FieldLabel,
    inputClassName,
    ModuleDrawer,
    ModuleEmpty,
    ModuleMetric,
    ModulePageHeader,
    ModuleStatus,
    selectClassName,
    textareaClassName,
} from '@/components/admin-ui/module-workspace';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Boxes,
    Flag,
    Gauge,
    Plus,
    Rocket,
    Search,
    ToggleRight,
    Trash2,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';

type Product = {
    id: number;
    name: string;
    product_code: string;
    status: string;
};

type FlagItem = {
    id: number;
    product_id: number;
    flag_key: string;
    name: string;
    description?: string | null;
    environment: string;
    is_enabled: boolean;
    rollout_percentage: number;
    updated_at: string;
    product_name: string;
    product_code: string;
    creator_name?: string | null;
};

type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    prev_page_url?: string | null;
    next_page_url?: string | null;
};

type Props = {
    flags: Paginated<FlagItem>;
    products: Product[];
    filters: {
        product_id?: number | null;
        environment?: string;
        search?: string;
    };
    stats: {
        total: number;
        enabled: number;
        production: number;
        partial_rollout: number;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Catalog & Plans', href: '/admin/products' },
    { title: 'Feature Flags', href: '/admin/feature-flags' },
];

export default function FeatureFlags({
    flags,
    products,
    filters,
    stats,
}: Props) {
    const [createOpen, setCreateOpen] = useState(false);
    const [selected, setSelected] = useState<FlagItem | null>(null);
    const [search, setSearch] = useState(filters.search ?? '');
    const [productId, setProductId] = useState(
        filters.product_id ? String(filters.product_id) : '',
    );
    const [environment, setEnvironment] = useState(
        filters.environment ?? '',
    );

    const createForm = useForm<CreateFlagData>({
        product_id: products[0] ? String(products[0].id) : '',
        flag_key: '',
        name: '',
        description: '',
        environment: 'staging',
        is_enabled: false,
        rollout_percentage: 0,
    });

    const editForm = useForm<EditFlagData>({
        name: '',
        description: '',
        is_enabled: false,
        rollout_percentage: 0,
    });

    function applyFilters(event: FormEvent) {
        event.preventDefault();
        router.get(
            '/admin/feature-flags',
            {
                search,
                product_id: productId,
                environment,
            },
            { preserveState: true, replace: true },
        );
    }

    function openDetails(flag: FlagItem) {
        setSelected(flag);
        editForm.setData({
            name: flag.name,
            description: flag.description ?? '',
            is_enabled: flag.is_enabled,
            rollout_percentage: flag.rollout_percentage,
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Feature Flags" />

            <div className="space-y-5">
                <ModulePageHeader
                    eyebrow="Controlled Product Delivery"
                    title="Feature Flags"
                    description="Release capabilities safely by product and environment, then control enablement and rollout percentage without redeploying."
                    actions={
                        <Button
                            type="button"
                            onClick={() => setCreateOpen(true)}
                            className="rounded-xl"
                        >
                            <Plus className="size-4" />
                            New flag
                        </Button>
                    }
                />

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <ModuleMetric
                        label="Feature flags"
                        value={stats.total}
                        hint="All environments"
                        icon={Flag}
                    />
                    <ModuleMetric
                        label="Enabled"
                        value={stats.enabled}
                        hint="Currently active"
                        icon={ToggleRight}
                    />
                    <ModuleMetric
                        label="Production"
                        value={stats.production}
                        hint="Live environment flags"
                        icon={Rocket}
                    />
                    <ModuleMetric
                        label="Partial rollout"
                        value={stats.partial_rollout}
                        hint="Between 1% and 99%"
                        icon={Gauge}
                    />
                </div>

                <section className="border-border/70 bg-card overflow-hidden rounded-2xl border shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
                    <div className="border-border/70 flex flex-col gap-3 border-b px-4 py-4 xl:flex-row xl:items-center xl:justify-between">
                        <div>
                            <h2 className="text-foreground text-sm font-semibold">
                                Flag directory
                            </h2>
                            <p className="text-muted-foreground mt-1 text-xs">
                                Toggle a flag immediately or open it to edit rollout controls.
                            </p>
                        </div>

                        <form
                            onSubmit={applyFilters}
                            className="grid gap-2 sm:grid-cols-4"
                        >
                            <div className="relative sm:col-span-2">
                                <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                                <input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Search flags..."
                                    className={`${inputClassName} pl-9`}
                                />
                            </div>

                            <select
                                value={productId}
                                onChange={(event) =>
                                    setProductId(event.target.value)
                                }
                                className={selectClassName}
                            >
                                <option value="">All products</option>
                                {products.map((product) => (
                                    <option
                                        key={product.id}
                                        value={product.id}
                                    >
                                        {product.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={environment}
                                onChange={(event) =>
                                    setEnvironment(event.target.value)
                                }
                                className={selectClassName}
                            >
                                <option value="">All environments</option>
                                <option value="local">Local</option>
                                <option value="staging">Staging</option>
                                <option value="production">Production</option>
                            </select>

                            <Button
                                type="submit"
                                variant="outline"
                                className="sm:col-start-4"
                            >
                                Apply
                            </Button>
                        </form>
                    </div>

                    {flags.data.length === 0 ? (
                        <ModuleEmpty
                            icon={Flag}
                            title="No feature flags found"
                            description="Create the first controlled release flag or adjust the current filters."
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[960px] text-left text-xs">
                                <thead>
                                    <tr className="border-border/70 text-muted-foreground border-b">
                                        <th className="px-4 py-3 font-semibold">
                                            Flag
                                        </th>
                                        <th className="px-4 py-3 font-semibold">
                                            Product
                                        </th>
                                        <th className="px-4 py-3 font-semibold">
                                            Environment
                                        </th>
                                        <th className="px-4 py-3 font-semibold">
                                            Rollout
                                        </th>
                                        <th className="px-4 py-3 font-semibold">
                                            State
                                        </th>
                                        <th className="px-4 py-3 font-semibold">
                                            Updated
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {flags.data.map((flag) => (
                                        <tr
                                            key={flag.id}
                                            className="border-border/60 hover:bg-primary/[0.035] cursor-pointer border-b last:border-b-0"
                                            onClick={() => openDetails(flag)}
                                        >
                                            <td className="px-4 py-4">
                                                <p className="text-foreground font-semibold">
                                                    {flag.name}
                                                </p>
                                                <p className="text-muted-foreground mt-1 font-mono text-[10px]">
                                                    {flag.flag_key}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="text-foreground font-medium">
                                                    {flag.product_name}
                                                </p>
                                                <p className="text-muted-foreground mt-1 text-[10px]">
                                                    {flag.product_code}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4 capitalize">
                                                {flag.environment}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-muted h-1.5 w-24 overflow-hidden rounded-full">
                                                        <div
                                                            className="bg-primary h-full"
                                                            style={{
                                                                width: `${flag.rollout_percentage}%`,
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="tabular-nums">
                                                        {flag.rollout_percentage}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        router.post(
                                                            `/admin/feature-flags/${flag.id}/toggle`,
                                                            {
                                                                is_enabled:
                                                                    !flag.is_enabled,
                                                            },
                                                            {
                                                                preserveScroll:
                                                                    true,
                                                            },
                                                        );
                                                    }}
                                                >
                                                    <ModuleStatus
                                                        value={
                                                            flag.is_enabled
                                                                ? 'enabled'
                                                                : 'disabled'
                                                        }
                                                    />
                                                </button>
                                            </td>
                                            <td className="text-muted-foreground px-4 py-4 text-[10px]">
                                                {new Date(
                                                    flag.updated_at,
                                                ).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="border-border/70 flex items-center justify-between border-t px-4 py-3">
                        <p className="text-muted-foreground text-xs">
                            Page {flags.current_page} of {flags.last_page}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!flags.prev_page_url}
                                onClick={() =>
                                    flags.prev_page_url &&
                                    router.visit(flags.prev_page_url)
                                }
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!flags.next_page_url}
                                onClick={() =>
                                    flags.next_page_url &&
                                    router.visit(flags.next_page_url)
                                }
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </section>
            </div>

            <ModuleDrawer
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                title="Create feature flag"
                description="Define a product-scoped flag for a specific environment."
                footer={
                    <Button
                        type="button"
                        className="w-full rounded-xl"
                        disabled={createForm.processing}
                        onClick={() =>
                            createForm.post('/admin/feature-flags', {
                                onSuccess: () => {
                                    createForm.reset();
                                    setCreateOpen(false);
                                },
                            })
                        }
                    >
                        Create flag
                    </Button>
                }
            >
                <FlagForm
                    mode="create"
                    products={products}
                    data={createForm.data}
                    errors={createForm.errors}
                    setData={(key, value) =>
                        createForm.setData(key as keyof CreateFlagData, value as never)
                    }
                />
            </ModuleDrawer>

            <ModuleDrawer
                open={selected !== null}
                onClose={() => setSelected(null)}
                title={selected?.name ?? 'Feature flag'}
                description={selected?.flag_key}
                footer={
                    selected && (
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                className="flex-1 rounded-xl"
                                disabled={editForm.processing}
                                onClick={() =>
                                    editForm.put(
                                        `/admin/feature-flags/${selected.id}`,
                                        {
                                            onSuccess: () =>
                                                setSelected(null),
                                        },
                                    )
                                }
                            >
                                Save changes
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={() => {
                                    if (confirm('Delete this feature flag?')) {
                                        router.delete(
                                            `/admin/feature-flags/${selected.id}`,
                                            {
                                                onSuccess: () =>
                                                    setSelected(null),
                                            },
                                        );
                                    }
                                }}
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        </div>
                    )
                }
            >
                {selected && (
                    <div className="space-y-5">
                        <div className="border-border/70 bg-card rounded-2xl border p-4">
                            <div className="flex items-center gap-3">
                                <span className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-xl">
                                    <Boxes className="size-4" />
                                </span>
                                <div>
                                    <p className="text-foreground text-sm font-semibold">
                                        {selected.product_name}
                                    </p>
                                    <p className="text-muted-foreground mt-1 text-xs capitalize">
                                        {selected.environment} environment
                                    </p>
                                </div>
                            </div>
                        </div>

                        <FlagForm
                            mode="edit"
                            products={products}
                            data={editForm.data}
                            errors={editForm.errors}
                            setData={(key, value) =>
                                editForm.setData(key as keyof EditFlagData, value as never)
                            }
                        />
                    </div>
                )}
            </ModuleDrawer>
        </AppLayout>
    );
}

type CreateFlagData = {
    product_id: string;
    flag_key: string;
    name: string;
    description: string;
    environment: string;
    is_enabled: boolean;
    rollout_percentage: number;
};

type EditFlagData = Omit<
    CreateFlagData,
    'product_id' | 'flag_key' | 'environment'
>;

function FlagForm({
    mode,
    products,
    data,
    errors,
    setData,
}: {
    mode: 'create' | 'edit';
    products: Product[];
    data: CreateFlagData | EditFlagData;
    errors: Partial<Record<string, string>>;
    setData: (key: string, value: string | number | boolean) => void;
}) {
    const createData = data as CreateFlagData;

    return (
        <div className="space-y-4">
            {mode === 'create' && (
                <>
                    <div>
                        <FieldLabel>Product</FieldLabel>
                        <select
                            value={createData.product_id}
                            onChange={(event) =>
                                setData('product_id', event.target.value)
                            }
                            className={selectClassName}
                        >
                            <option value="">Select product</option>
                            {products.map((product) => (
                                <option key={product.id} value={product.id}>
                                    {product.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <FieldLabel>Flag key</FieldLabel>
                        <input
                            value={createData.flag_key}
                            onChange={(event) =>
                                setData('flag_key', event.target.value)
                            }
                            className={inputClassName}
                            placeholder="inventory.batch_expiry_alerts"
                        />
                        {errors.flag_key && (
                            <p className="text-destructive mt-1 text-xs">
                                {errors.flag_key}
                            </p>
                        )}
                    </div>

                    <div>
                        <FieldLabel>Environment</FieldLabel>
                        <select
                            value={createData.environment}
                            onChange={(event) =>
                                setData('environment', event.target.value)
                            }
                            className={selectClassName}
                        >
                            <option value="local">Local</option>
                            <option value="staging">Staging</option>
                            <option value="production">Production</option>
                        </select>
                    </div>
                </>
            )}

            <div>
                <FieldLabel>Name</FieldLabel>
                <input
                    value={data.name}
                    onChange={(event) =>
                        setData('name', event.target.value)
                    }
                    className={inputClassName}
                    placeholder="Batch expiry alerts"
                />
            </div>

            <div>
                <FieldLabel>Description</FieldLabel>
                <textarea
                    value={data.description}
                    onChange={(event) =>
                        setData('description', event.target.value)
                    }
                    rows={4}
                    className={textareaClassName}
                    placeholder="Explain what the flag controls."
                />
            </div>

            <div>
                <div className="mb-2 flex items-center justify-between">
                    <FieldLabel>Rollout percentage</FieldLabel>
                    <span className="text-primary text-sm font-semibold tabular-nums">
                        {data.rollout_percentage}%
                    </span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={data.rollout_percentage}
                    onChange={(event) =>
                        setData(
                            'rollout_percentage',
                            Number(event.target.value),
                        )
                    }
                    className="accent-primary w-full"
                />
            </div>

            <label className="border-border/70 bg-card flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-xs">
                <input
                    type="checkbox"
                    checked={data.is_enabled}
                    onChange={(event) =>
                        setData('is_enabled', event.target.checked)
                    }
                    className="accent-primary"
                />
                Enable this flag immediately
            </label>
        </div>
    );
}
