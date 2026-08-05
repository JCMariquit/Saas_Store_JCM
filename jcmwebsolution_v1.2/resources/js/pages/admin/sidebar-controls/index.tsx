import InputError from '@/components/input-error';
import { SectionCard } from '@/components/admin-ui/section-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    BadgeCheck,
    Boxes,
    Check,
    ChevronRight,
    Circle,
    Eye,
    EyeOff,
    FolderTree,
    Group,
    LayoutPanelLeft,
    Link2,
    ListTree,
    PanelLeft,
    Plus,
    RefreshCw,
    Route,
    Search,
    Settings2,
    Trash2,
    X,
} from 'lucide-react';
import {
    useEffect,
    useMemo,
    useState,
    type FormEvent,
    type ReactNode,
} from 'react';

type Item = {
    id: number;
    parent_id?: number | null;
    item_key: string;
    item_type: string;
    label: string;
    route_name?: string | null;
    url_override?: string | null;
    icon_key?: string | null;
    badge?: string | null;
    sort_order: number;
    status: string;
    is_visible: boolean;
};

type Product = {
    id: number;
    name: string;
};

type Feature = {
    id: number;
    name: string;
};

type Props = {
    platformItems: Item[];
    productItems: Item[];
    products: Product[];
    selectedProductId: number;
    features: Feature[];
};

type PlatformFormData = {
    parent_id: string;
    item_key: string;
    item_type: string;
    label: string;
    route_name: string;
    url_override: string;
    icon_key: string;
    badge: string;
    sort_order: number;
    allowed_roles: string[];
    is_visible: boolean;
    status: string;
};

type ProductFormData = {
    product_id: string;
    parent_id: string;
    feature_id: string;
    item_key: string;
    section_key: string;
    item_type: string;
    label: string;
    route_name: string;
    url_override: string;
    icon_key: string;
    badge: string;
    badge_id: string;
    sort_order: number;
    is_developer_ready: boolean;
    is_visible: boolean;
    status: string;
    role_ids: number[];
};

type SidebarTab = 'platform' | 'product';

type DrawerState =
    | { type: 'create-platform' }
    | { type: 'platform-details'; item: Item }
    | { type: 'create-product' }
    | { type: 'product-details'; item: Item }
    | null;

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Systems Management',
        href: '/admin/systems',
    },
    {
        title: 'Sidebar Controls',
        href: '/admin/sidebar-controls',
    },
];

const selectClassName =
    'h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary/60 focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60';

export default function SidebarControls(props: Props) {
    const page = usePage();
    const initialTab: SidebarTab = page.url.includes('tab=product')
        ? 'product'
        : 'platform';

    const [activeTab, setActiveTab] =
        useState<SidebarTab>(initialTab);
    const [drawer, setDrawer] = useState<DrawerState>(null);
    const [productSearch, setProductSearch] = useState('');

    const switchTab = (tab: SidebarTab) => {
        setActiveTab(tab);

        if (typeof window === 'undefined') {
            return;
        }

        const url = new URL(window.location.href);

        if (tab === 'product') {
            url.searchParams.set('tab', 'product');
        } else {
            url.searchParams.delete('tab');
        }

        window.history.replaceState(
            window.history.state,
            '',
            `${url.pathname}${url.search}${url.hash}`,
        );
    };

    const selectedProduct = useMemo(
        () =>
            props.products.find(
                (product) => product.id === props.selectedProductId,
            ),
        [props.products, props.selectedProductId],
    );

    const sortedProducts = useMemo(
        () =>
            [...props.products].sort((first, second) =>
                first.name.localeCompare(second.name),
            ),
        [props.products],
    );

    const filteredProducts = useMemo(() => {
        const query = productSearch.trim().toLowerCase();

        if (!query) {
            return sortedProducts;
        }

        return sortedProducts.filter((product) =>
            product.name.toLowerCase().includes(query),
        );
    }, [productSearch, sortedProducts]);

    const activeItems =
        activeTab === 'platform'
            ? props.platformItems
            : props.productItems;

    const visibleCount = useMemo(
        () => activeItems.filter((item) => item.is_visible).length,
        [activeItems],
    );

    const groupCount = useMemo(
        () =>
            activeItems.filter(
                (item) => item.item_type.toLowerCase() === 'group',
            ).length,
        [activeItems],
    );

    const activeCount = useMemo(
        () =>
            activeItems.filter(
                (item) => item.status.toLowerCase() === 'active',
            ).length,
        [activeItems],
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sidebar Controls" />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Sidebar Controls
                        </h1>

                        <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
                            Manage the dynamic navigation used by the Flagship
                            platform and each connected JCM system.
                        </p>
                    </div>

                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        icon={<PanelLeft className="size-5" />}
                        label="Sidebar items"
                        value={activeItems.length}
                        description={
                            activeTab === 'platform'
                                ? 'Flagship navigation records'
                                : selectedProduct?.name ??
                                  'Selected product navigation'
                        }
                    />

                    <SummaryCard
                        icon={<FolderTree className="size-5" />}
                        label="Groups"
                        value={groupCount}
                        description="Parent navigation sections"
                        tone="indigo"
                    />

                    <SummaryCard
                        icon={<Eye className="size-5" />}
                        label="Visible"
                        value={visibleCount}
                        description="Rendered navigation items"
                        tone="success"
                    />

                    <SummaryCard
                        icon={<BadgeCheck className="size-5" />}
                        label="Active"
                        value={activeCount}
                        description="Enabled sidebar definitions"
                        tone="warning"
                    />
                </div>

                <SectionCard
                    title="Navigation directory"
                    description="Switch between the central platform and product-specific sidebar definitions."
                    actions={
                        <Button
                            type="button"
                            size="sm"
                            className="rounded-xl"
                            onClick={() =>
                                setDrawer(
                                    activeTab === 'platform'
                                        ? {
                                              type: 'create-platform',
                                          }
                                        : {
                                              type: 'create-product',
                                          },
                                )
                            }
                        >
                            <Plus className="size-4" />

                            {activeTab === 'platform'
                                ? 'Add Flagship item'
                                : 'Add product item'}
                        </Button>
                    }
                >
                    <div>
                        <div className="flex items-end gap-7 border-b border-border">
                            <button
                                type="button"
                                className={[
                                    '-mb-px inline-flex items-center gap-2 border-b-2 px-1 pb-3 pt-1 text-xs font-semibold transition',
                                    activeTab === 'platform'
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
                                ].join(' ')}
                                onClick={() => switchTab('platform')}
                            >
                                <LayoutPanelLeft className="size-4" />

                                <span>Flagship Sidebar</span>

                                <span
                                    className={[
                                        'rounded-full px-2 py-0.5 text-[9px] font-bold',
                                        activeTab === 'platform'
                                            ? 'bg-primary/10 text-primary'
                                            : 'bg-muted text-muted-foreground',
                                    ].join(' ')}
                                >
                                    {props.platformItems.length}
                                </span>
                            </button>

                            <button
                                type="button"
                                className={[
                                    '-mb-px inline-flex items-center gap-2 border-b-2 px-1 pb-3 pt-1 text-xs font-semibold transition',
                                    activeTab === 'product'
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
                                ].join(' ')}
                                onClick={() => switchTab('product')}
                            >
                                <Boxes className="size-4" />

                                <span>Product Sidebar</span>

                                <span
                                    className={[
                                        'rounded-full px-2 py-0.5 text-[9px] font-bold',
                                        activeTab === 'product'
                                            ? 'bg-primary/10 text-primary'
                                            : 'bg-muted text-muted-foreground',
                                    ].join(' ')}
                                >
                                    {props.products.length}
                                </span>
                            </button>
                        </div>

                        <div className="pt-2">
                            {activeTab === 'platform' ? (
                                <CompactItemList
                                    items={props.platformItems}
                                    emptyTitle="No Flagship sidebar items"
                                    emptyDescription="Create the first dynamic navigation item for the central platform."
                                    onSelect={(item) =>
                                        setDrawer({
                                            type: 'platform-details',
                                            item,
                                        })
                                    }
                                />
                            ) : (
                                <ProductSidebarWorkspace
                                    products={filteredProducts}
                                    totalProducts={props.products.length}
                                    selectedProductId={
                                        props.selectedProductId
                                    }
                                    selectedProductName={
                                        selectedProduct?.name ??
                                        'Selected product'
                                    }
                                    search={productSearch}
                                    items={props.productItems}
                                    onSearchChange={setProductSearch}
                                    onProductSelect={(productId) =>
                                        router.get(
                                            '/admin/sidebar-controls',
                                            {
                                                product_id: productId,
                                                tab: 'product',
                                            },
                                            {
                                                preserveState: true,
                                                preserveScroll: true,
                                                replace: true,
                                            },
                                        )
                                    }
                                    onItemSelect={(item) =>
                                        setDrawer({
                                            type: 'product-details',
                                            item,
                                        })
                                    }
                                />
                            )}
                        </div>
                    </div>
                </SectionCard>
            </div>

            {drawer?.type === 'create-platform' && (
                <CreatePlatformItemDrawer
                    platformItems={props.platformItems}
                    onClose={() => setDrawer(null)}
                />
            )}

            {drawer?.type === 'platform-details' && (
                <ItemDetailsDrawer
                    item={drawer.item}
                    allItems={props.platformItems}
                    scopeLabel="Flagship sidebar"
                    deletePrefix="/admin/sidebar-controls/platform"
                    onClose={() => setDrawer(null)}
                />
            )}

            {drawer?.type === 'create-product' && (
                <CreateProductItemDrawer
                    selectedProductId={props.selectedProductId}
                    productItems={props.productItems}
                    features={props.features}
                    onClose={() => setDrawer(null)}
                />
            )}

            {drawer?.type === 'product-details' && (
                <ItemDetailsDrawer
                    item={drawer.item}
                    allItems={props.productItems}
                    scopeLabel={selectedProduct?.name ?? 'Product sidebar'}
                    deletePrefix="/admin/sidebar-controls/product"
                    onClose={() => setDrawer(null)}
                />
            )}
        </AppLayout>
    );
}

function ProductSidebarWorkspace({
    products,
    totalProducts,
    selectedProductId,
    selectedProductName,
    search,
    items,
    onSearchChange,
    onProductSelect,
    onItemSelect,
}: {
    products: Product[];
    totalProducts: number;
    selectedProductId: number;
    selectedProductName: string;
    search: string;
    items: Item[];
    onSearchChange: (value: string) => void;
    onProductSelect: (productId: number) => void;
    onItemSelect: (item: Item) => void;
}) {
    return (
        <div className="grid min-h-[420px] gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
            <aside className="border-b border-border pb-5 lg:border-r lg:border-b-0 lg:pr-5 lg:pb-0">
                <div>
                    <p className="text-xs font-semibold text-foreground">
                        Product directory
                    </p>

                    <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
                        {totalProducts.toLocaleString()} JCM product
                        {totalProducts === 1 ? '' : 's'}, sorted A–Z.
                    </p>
                </div>

                <div className="relative mt-4">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                        className="h-9 rounded-xl pl-9 text-xs"
                        value={search}
                        onChange={(event) =>
                            onSearchChange(event.target.value)
                        }
                        placeholder="Search products..."
                    />
                </div>

                <div className="mt-3 max-h-72 overflow-y-auto">
                    {products.length === 0 ? (
                        <p className="py-6 text-center text-xs text-muted-foreground">
                            No matching products.
                        </p>
                    ) : (
                        <div className="divide-y divide-border/60">
                            {products.map((product) => {
                                const selected =
                                    product.id === selectedProductId;

                                return (
                                    <button
                                        key={product.id}
                                        type="button"
                                        className={[
                                            'flex w-full items-center gap-3 px-1 py-3 text-left transition',
                                            selected
                                                ? 'text-primary'
                                                : 'text-muted-foreground hover:text-foreground',
                                        ].join(' ')}
                                        onClick={() =>
                                            onProductSelect(product.id)
                                        }
                                    >
                                        <span
                                            className={[
                                                'flex size-8 shrink-0 items-center justify-center rounded-lg',
                                                selected
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'bg-muted text-muted-foreground',
                                            ].join(' ')}
                                        >
                                            <Boxes className="size-3.5" />
                                        </span>

                                        <span className="min-w-0 flex-1 truncate text-xs font-semibold">
                                            {product.name}
                                        </span>

                                        {selected && (
                                            <Check className="size-3.5 shrink-0" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </aside>

            <section className="min-w-0">
                <div className="flex flex-col gap-2 border-b border-border/70 pb-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-[10px] font-semibold tracking-[0.13em] text-muted-foreground uppercase">
                            Selected product
                        </p>

                        <h3 className="mt-1 text-sm font-semibold text-foreground">
                            {selectedProductName}
                        </h3>
                    </div>

                    <p className="text-[10px] text-muted-foreground">
                        {items.length.toLocaleString()} sidebar item
                        {items.length === 1 ? '' : 's'}
                    </p>
                </div>

                <CompactItemList
                    items={items}
                    emptyTitle="No sidebar items for this product"
                    emptyDescription="Create the first navigation item for the selected JCM system."
                    onSelect={onItemSelect}
                />
            </section>
        </div>
    );
}

function CompactItemList({
    items,
    emptyTitle,
    emptyDescription,
    onSelect,
}: {
    items: Item[];
    emptyTitle: string;
    emptyDescription: string;
    onSelect: (item: Item) => void;
}) {
    const sortedItems = useMemo(
        () =>
            [...items].sort(
                (first, second) =>
                    first.sort_order - second.sort_order ||
                    first.label.localeCompare(second.label),
            ),
        [items],
    );

    if (sortedItems.length === 0) {
        return (
            <EmptyDirectory
                icon={<ListTree className="size-5" />}
                title={emptyTitle}
                description={emptyDescription}
            />
        );
    }

    return (
        <div>
            <div className="hidden grid-cols-[minmax(0,1fr)_100px_110px_90px_64px_24px] items-center gap-3 border-b border-border/70 px-1 py-2.5 md:grid">
                <span className="text-[9px] font-semibold tracking-[0.13em] text-muted-foreground uppercase">
                    Navigation item
                </span>

                <span className="text-[9px] font-semibold tracking-[0.13em] text-muted-foreground uppercase">
                    Type
                </span>

                <span className="text-[9px] font-semibold tracking-[0.13em] text-muted-foreground uppercase">
                    Visibility
                </span>

                <span className="text-[9px] font-semibold tracking-[0.13em] text-muted-foreground uppercase">
                    Status
                </span>

                <span className="text-right text-[9px] font-semibold tracking-[0.13em] text-muted-foreground uppercase">
                    Order
                </span>

                <span />
            </div>

            <div className="divide-y divide-border/60">
                {sortedItems.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        className="grid w-full grid-cols-[minmax(0,1fr)_24px] items-center gap-3 px-1 py-3.5 text-left transition hover:bg-muted/20 md:grid-cols-[minmax(0,1fr)_100px_110px_90px_64px_24px]"
                        onClick={() => onSelect(item)}
                    >
                        <div className="flex min-w-0 items-center gap-3">
                            <ItemTypeIcon itemType={item.item_type} />

                            <div className="min-w-0 flex-1">
                                <div className="flex min-w-0 items-center gap-2">
                                    <p className="truncate text-sm font-semibold text-foreground">
                                        {item.label}
                                    </p>

                                    {item.badge && (
                                        <span className="shrink-0 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[8px] font-bold uppercase text-primary">
                                            {item.badge}
                                        </span>
                                    )}
                                </div>

                                <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">
                                    {item.item_key}
                                    {' · '}
                                    {item.route_name ||
                                        item.url_override ||
                                        'No navigation target'}
                                </p>
                            </div>
                        </div>

                        <div className="hidden md:block">
                            <TypeBadge itemType={item.item_type} />
                        </div>

                        <div className="hidden md:block">
                            <VisibilityBadge visible={item.is_visible} />
                        </div>

                        <div className="hidden md:block">
                            <StatusBadge status={item.status} />
                        </div>

                        <span className="hidden text-right text-[10px] font-semibold text-muted-foreground md:block">
                            {item.sort_order}
                        </span>

                        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                    </button>
                ))}
            </div>
        </div>
    );
}

function CreatePlatformItemDrawer({
    platformItems,
    onClose,
}: {
    platformItems: Item[];
    onClose: () => void;
}) {
    const form = useForm<PlatformFormData>({
        parent_id: '',
        item_key: '',
        item_type: 'link',
        label: '',
        route_name: '',
        url_override: '',
        icon_key: 'Circle',
        badge: '',
        sort_order: 100,
        allowed_roles: ['super_admin', 'admin'],
        is_visible: true,
        status: 'active',
    });

    const groups = platformItems.filter(
        (item) => item.item_type.toLowerCase() === 'group',
    );

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.post('/admin/sidebar-controls/platform', {
            preserveScroll: true,
            onSuccess: onClose,
        });
    };

    const toggleAllowedRole = (role: string) => {
        const roles = form.data.allowed_roles.includes(role)
            ? form.data.allowed_roles.filter(
                  (existingRole) => existingRole !== role,
              )
            : [...form.data.allowed_roles, role];

        form.setData('allowed_roles', roles);
    };

    return (
        <DetailDrawer
            title="Add Flagship sidebar item"
            description="Create a dynamic navigation record for the central platform."
            onClose={onClose}
        >
            <form onSubmit={submit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Item key" required>
                        <Input
                            value={form.data.item_key}
                            onChange={(event) =>
                                form.setData(
                                    'item_key',
                                    event.target.value,
                                )
                            }
                            placeholder="payment-verification"
                        />

                        <InputError message={form.errors.item_key} />
                    </Field>

                    <Field label="Label" required>
                        <Input
                            value={form.data.label}
                            onChange={(event) =>
                                form.setData(
                                    'label',
                                    event.target.value,
                                )
                            }
                            placeholder="Payment Verification"
                        />

                        <InputError message={form.errors.label} />
                    </Field>

                    <Field label="Item type" required>
                        <select
                            className={selectClassName}
                            value={form.data.item_type}
                            onChange={(event) =>
                                form.setData(
                                    'item_type',
                                    event.target.value,
                                )
                            }
                        >
                            <option value="group">Group</option>
                            <option value="link">Link</option>
                            <option value="heading">Heading</option>
                        </select>

                        <InputError message={form.errors.item_type} />
                    </Field>

                    <Field label="Parent group">
                        <select
                            className={selectClassName}
                            value={form.data.parent_id}
                            onChange={(event) =>
                                form.setData(
                                    'parent_id',
                                    event.target.value,
                                )
                            }
                        >
                            <option value="">No parent</option>

                            {groups.map((group) => (
                                <option key={group.id} value={group.id}>
                                    {group.label}
                                </option>
                            ))}
                        </select>

                        <InputError message={form.errors.parent_id} />
                    </Field>
                </div>

                <TargetFields
                    routeName={form.data.route_name}
                    urlOverride={form.data.url_override}
                    onRouteNameChange={(value) =>
                        form.setData('route_name', value)
                    }
                    onUrlOverrideChange={(value) =>
                        form.setData('url_override', value)
                    }
                    routeError={form.errors.route_name}
                    urlError={form.errors.url_override}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Lucide icon key">
                        <Input
                            value={form.data.icon_key}
                            onChange={(event) =>
                                form.setData(
                                    'icon_key',
                                    event.target.value,
                                )
                            }
                            placeholder="Circle"
                        />

                        <InputError message={form.errors.icon_key} />
                    </Field>

                    <Field label="Badge">
                        <Input
                            value={form.data.badge}
                            onChange={(event) =>
                                form.setData(
                                    'badge',
                                    event.target.value,
                                )
                            }
                            placeholder="LIVE"
                        />

                        <InputError message={form.errors.badge} />
                    </Field>

                    <Field label="Sort order">
                        <Input
                            type="number"
                            min={0}
                            value={form.data.sort_order}
                            onChange={(event) =>
                                form.setData(
                                    'sort_order',
                                    Number(event.target.value || 0),
                                )
                            }
                        />

                        <InputError message={form.errors.sort_order} />
                    </Field>

                    <Field label="Status">
                        <select
                            className={selectClassName}
                            value={form.data.status}
                            onChange={(event) =>
                                form.setData(
                                    'status',
                                    event.target.value,
                                )
                            }
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>

                        <InputError message={form.errors.status} />
                    </Field>
                </div>

                <DetailSection title="Allowed platform roles">
                    <div className="grid gap-2 sm:grid-cols-2">
                        {['super_admin', 'admin'].map((role) => (
                            <ToggleCard
                                key={role}
                                checked={form.data.allowed_roles.includes(
                                    role,
                                )}
                                label={formatLabel(role)}
                                description="Can see this navigation item"
                                onChange={() => toggleAllowedRole(role)}
                            />
                        ))}
                    </div>

                    <InputError message={form.errors.allowed_roles} />
                </DetailSection>

                <ToggleCard
                    checked={form.data.is_visible}
                    label="Visible in sidebar"
                    description="Show this item when its role and status rules pass."
                    onChange={() =>
                        form.setData(
                            'is_visible',
                            !form.data.is_visible,
                        )
                    }
                />

                <DrawerActions>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={form.processing}
                    >
                        Cancel
                    </Button>

                    <Button type="submit" disabled={form.processing}>
                        {form.processing ? (
                            <>
                                <RefreshCw className="size-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Plus className="size-4" />
                                Add Flagship item
                            </>
                        )}
                    </Button>
                </DrawerActions>
            </form>
        </DetailDrawer>
    );
}

function CreateProductItemDrawer({
    selectedProductId,
    productItems,
    features,
    onClose,
}: {
    selectedProductId: number;
    productItems: Item[];
    features: Feature[];
    onClose: () => void;
}) {
    const form = useForm<ProductFormData>({
        product_id: String(selectedProductId),
        parent_id: '',
        feature_id: '',
        item_key: '',
        section_key: 'management',
        item_type: 'link',
        label: '',
        route_name: '',
        url_override: '',
        icon_key: 'Circle',
        badge: '',
        badge_id: '',
        sort_order: 100,
        is_developer_ready: true,
        is_visible: true,
        status: 'active',
        role_ids: [],
    });

    const groups = productItems.filter(
        (item) => item.item_type.toLowerCase() === 'group',
    );

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.post('/admin/sidebar-controls/product', {
            preserveScroll: true,
            onSuccess: onClose,
        });
    };

    return (
        <DetailDrawer
            title="Add product sidebar item"
            description="Create a navigation record for the selected JCM system."
            onClose={onClose}
        >
            <form onSubmit={submit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Item key" required>
                        <Input
                            value={form.data.item_key}
                            onChange={(event) =>
                                form.setData(
                                    'item_key',
                                    event.target.value,
                                )
                            }
                            placeholder="stock-movements"
                        />

                        <InputError message={form.errors.item_key} />
                    </Field>

                    <Field label="Label" required>
                        <Input
                            value={form.data.label}
                            onChange={(event) =>
                                form.setData(
                                    'label',
                                    event.target.value,
                                )
                            }
                            placeholder="Stock Movements"
                        />

                        <InputError message={form.errors.label} />
                    </Field>

                    <Field label="Item type" required>
                        <select
                            className={selectClassName}
                            value={form.data.item_type}
                            onChange={(event) =>
                                form.setData(
                                    'item_type',
                                    event.target.value,
                                )
                            }
                        >
                            <option value="group">Group</option>
                            <option value="link">Link</option>
                            <option value="heading">Heading</option>
                        </select>

                        <InputError message={form.errors.item_type} />
                    </Field>

                    <Field label="Parent group">
                        <select
                            className={selectClassName}
                            value={form.data.parent_id}
                            onChange={(event) =>
                                form.setData(
                                    'parent_id',
                                    event.target.value,
                                )
                            }
                        >
                            <option value="">No parent</option>

                            {groups.map((group) => (
                                <option key={group.id} value={group.id}>
                                    {group.label}
                                </option>
                            ))}
                        </select>

                        <InputError message={form.errors.parent_id} />
                    </Field>

                    <Field label="Sidebar section">
                        <Input
                            value={form.data.section_key}
                            onChange={(event) =>
                                form.setData(
                                    'section_key',
                                    event.target.value,
                                )
                            }
                            placeholder="management"
                        />

                        <InputError message={form.errors.section_key} />
                    </Field>

                    <Field label="Required capability">
                        <select
                            className={selectClassName}
                            value={form.data.feature_id}
                            onChange={(event) =>
                                form.setData(
                                    'feature_id',
                                    event.target.value,
                                )
                            }
                        >
                            <option value="">No capability required</option>

                            {features.map((feature) => (
                                <option
                                    key={feature.id}
                                    value={feature.id}
                                >
                                    {feature.name}
                                </option>
                            ))}
                        </select>

                        <InputError message={form.errors.feature_id} />
                    </Field>
                </div>

                <TargetFields
                    routeName={form.data.route_name}
                    urlOverride={form.data.url_override}
                    onRouteNameChange={(value) =>
                        form.setData('route_name', value)
                    }
                    onUrlOverrideChange={(value) =>
                        form.setData('url_override', value)
                    }
                    routeError={form.errors.route_name}
                    urlError={form.errors.url_override}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Lucide icon key">
                        <Input
                            value={form.data.icon_key}
                            onChange={(event) =>
                                form.setData(
                                    'icon_key',
                                    event.target.value,
                                )
                            }
                            placeholder="Circle"
                        />

                        <InputError message={form.errors.icon_key} />
                    </Field>

                    <Field label="Badge text">
                        <Input
                            value={form.data.badge}
                            onChange={(event) =>
                                form.setData(
                                    'badge',
                                    event.target.value,
                                )
                            }
                            placeholder="BETA"
                        />

                        <InputError message={form.errors.badge} />
                    </Field>

                    <Field label="Badge ID">
                        <Input
                            value={form.data.badge_id}
                            onChange={(event) =>
                                form.setData(
                                    'badge_id',
                                    event.target.value,
                                )
                            }
                            placeholder="Optional badge record ID"
                        />

                        <InputError message={form.errors.badge_id} />
                    </Field>

                    <Field label="Sort order">
                        <Input
                            type="number"
                            min={0}
                            value={form.data.sort_order}
                            onChange={(event) =>
                                form.setData(
                                    'sort_order',
                                    Number(event.target.value || 0),
                                )
                            }
                        />

                        <InputError message={form.errors.sort_order} />
                    </Field>

                    <Field label="Status">
                        <select
                            className={selectClassName}
                            value={form.data.status}
                            onChange={(event) =>
                                form.setData(
                                    'status',
                                    event.target.value,
                                )
                            }
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>

                        <InputError message={form.errors.status} />
                    </Field>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                    <ToggleCard
                        checked={form.data.is_developer_ready}
                        label="Developer ready"
                        description="The destination page or module is implemented."
                        onChange={() =>
                            form.setData(
                                'is_developer_ready',
                                !form.data.is_developer_ready,
                            )
                        }
                    />

                    <ToggleCard
                        checked={form.data.is_visible}
                        label="Visible in sidebar"
                        description="Allow the renderer to display this item."
                        onChange={() =>
                            form.setData(
                                'is_visible',
                                !form.data.is_visible,
                            )
                        }
                    />
                </div>

                <DrawerActions>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={form.processing}
                    >
                        Cancel
                    </Button>

                    <Button type="submit" disabled={form.processing}>
                        {form.processing ? (
                            <>
                                <RefreshCw className="size-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Plus className="size-4" />
                                Add product item
                            </>
                        )}
                    </Button>
                </DrawerActions>
            </form>
        </DetailDrawer>
    );
}

function ItemDetailsDrawer({
    item,
    allItems,
    scopeLabel,
    deletePrefix,
    onClose,
}: {
    item: Item;
    allItems: Item[];
    scopeLabel: string;
    deletePrefix: string;
    onClose: () => void;
}) {
    const parent = allItems.find(
        (candidate) => candidate.id === item.parent_id,
    );

    const children = allItems
        .filter((candidate) => candidate.parent_id === item.id)
        .sort(
            (first, second) =>
                first.sort_order - second.sort_order,
        );

    const remove = () => {
        const confirmed = window.confirm(
            `Delete the sidebar item "${item.label}"? Child items and role assignments may also be affected.`,
        );

        if (!confirmed) {
            return;
        }

        router.delete(`${deletePrefix}/${item.id}`, {
            preserveScroll: true,
            onSuccess: onClose,
        });
    };

    return (
        <DetailDrawer
            title={item.label}
            description={`${scopeLabel} navigation details`}
            onClose={onClose}
        >
            <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-2">
                    <TypeBadge itemType={item.item_type} />
                    <VisibilityBadge visible={item.is_visible} />
                    <StatusBadge status={item.status} />

                    {item.badge && (
                        <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[9px] font-bold uppercase text-primary">
                            {item.badge}
                        </span>
                    )}
                </div>

                <DetailSection title="Navigation definition">
                    <DetailRow
                        label="Item key"
                        value={item.item_key}
                        mono
                    />

                    <DetailRow
                        label="Item type"
                        value={formatLabel(item.item_type)}
                    />

                    <DetailRow
                        label="Parent"
                        value={parent?.label ?? 'No parent'}
                    />

                    <DetailRow
                        label="Sort order"
                        value={String(item.sort_order)}
                    />

                    <DetailRow
                        label="Icon key"
                        value={item.icon_key || 'No icon'}
                        mono
                    />
                </DetailSection>

                <DetailSection title="Navigation target">
                    <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                        <div className="flex items-start gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-background text-primary">
                                {item.route_name ? (
                                    <Route className="size-4" />
                                ) : (
                                    <Link2 className="size-4" />
                                )}
                            </div>

                            <div className="min-w-0">
                                <p className="text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                                    {item.route_name
                                        ? 'Laravel route'
                                        : item.url_override
                                          ? 'URL override'
                                          : 'No target'}
                                </p>

                                <p className="mt-1 break-all font-mono text-xs font-semibold text-foreground">
                                    {item.route_name ||
                                        item.url_override ||
                                        'This item does not navigate to a page.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </DetailSection>

                {children.length > 0 && (
                    <DetailSection title={`Child items (${children.length})`}>
                        <div className="space-y-2">
                            {children.map((child) => (
                                <div
                                    key={child.id}
                                    className="flex items-center gap-3 rounded-xl border border-border/60 px-3 py-2.5"
                                >
                                    <ItemTypeIcon
                                        itemType={child.item_type}
                                        compact
                                    />

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-xs font-semibold">
                                            {child.label}
                                        </p>

                                        <p className="mt-0.5 truncate font-mono text-[9px] text-muted-foreground">
                                            {child.item_key}
                                        </p>
                                    </div>

                                    <span className="text-[9px] font-semibold text-muted-foreground">
                                        #{child.sort_order}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </DetailSection>
                )}

                <div className="border-t border-border pt-5">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={remove}
                    >
                        <Trash2 className="size-4" />
                        Delete sidebar item
                    </Button>
                </div>
            </div>
        </DetailDrawer>
    );
}

function TargetFields({
    routeName,
    urlOverride,
    onRouteNameChange,
    onUrlOverrideChange,
    routeError,
    urlError,
}: {
    routeName: string;
    urlOverride: string;
    onRouteNameChange: (value: string) => void;
    onUrlOverrideChange: (value: string) => void;
    routeError?: string;
    urlError?: string;
}) {
    return (
        <DetailSection title="Navigation target">
            <div className="grid gap-4 sm:grid-cols-2">
                <Field
                    label="Laravel route name"
                    hint="Preferred for internal Flagship routes."
                >
                    <Input
                        value={routeName}
                        onChange={(event) =>
                            onRouteNameChange(event.target.value)
                        }
                        placeholder="admin.systems.index"
                    />

                    <InputError message={routeError} />
                </Field>

                <Field
                    label="URL override"
                    hint="Use only when a route name is not available."
                >
                    <Input
                        value={urlOverride}
                        onChange={(event) =>
                            onUrlOverrideChange(event.target.value)
                        }
                        placeholder="/admin/custom-page"
                    />

                    <InputError message={urlError} />
                </Field>
            </div>
        </DetailSection>
    );
}

function ToggleCard({
    checked,
    label,
    description,
    onChange,
}: {
    checked: boolean;
    label: string;
    description: string;
    onChange: () => void;
}) {
    return (
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/70 bg-muted/20 p-4">
            <input
                type="checkbox"
                className="mt-0.5 size-4 rounded border-border text-primary focus:ring-primary"
                checked={checked}
                onChange={onChange}
            />

            <span>
                <span className="block text-xs font-semibold">
                    {label}
                </span>

                <span className="mt-1 block text-[11px] leading-4 text-muted-foreground">
                    {description}
                </span>
            </span>
        </label>
    );
}

function DetailDrawer({
    title,
    description,
    children,
    onClose,
}: {
    title: string;
    description?: string;
    children: ReactNode;
    onClose: () => void;
}) {
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [onClose]);

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
                            {title}
                        </h2>

                        {description && (
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                {description}
                            </p>
                        )}
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
                    {children}
                </div>
            </aside>
        </div>
    );
}

function ItemTypeIcon({
    itemType,
    compact = false,
}: {
    itemType: string;
    compact?: boolean;
}) {
    const icon =
        itemType.toLowerCase() === 'group' ? (
            <Group className={compact ? 'size-3.5' : 'size-4'} />
        ) : itemType.toLowerCase() === 'heading' ? (
            <Settings2
                className={compact ? 'size-3.5' : 'size-4'}
            />
        ) : (
            <Link2 className={compact ? 'size-3.5' : 'size-4'} />
        );

    return (
        <div
            className={[
                'flex shrink-0 items-center justify-center bg-primary/10 text-primary',
                compact
                    ? 'size-8 rounded-lg'
                    : 'size-9 rounded-xl',
            ].join(' ')}
        >
            {icon}
        </div>
    );
}

function TypeBadge({ itemType }: { itemType: string }) {
    return (
        <span className="rounded-full border border-border bg-muted/30 px-2 py-0.5 text-[9px] font-semibold uppercase text-muted-foreground">
            {formatLabel(itemType)}
        </span>
    );
}

function VisibilityBadge({ visible }: { visible: boolean }) {
    return (
        <span
            className={[
                'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase',
                visible
                    ? 'border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-400'
                    : 'border-border bg-muted text-muted-foreground',
            ].join(' ')}
        >
            {visible ? (
                <Eye className="size-3" />
            ) : (
                <EyeOff className="size-3" />
            )}

            {visible ? 'Visible' : 'Hidden'}
        </span>
    );
}

function StatusBadge({ status }: { status: string }) {
    const active = status.toLowerCase() === 'active';

    return (
        <span
            className={[
                'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase',
                active
                    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    : 'border-border bg-muted text-muted-foreground',
            ].join(' ')}
        >
            {active ? (
                <Check className="size-3" />
            ) : (
                <Circle className="size-3" />
            )}

            {formatLabel(status)}
        </span>
    );
}

function SummaryCard({
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
    tone?: 'default' | 'success' | 'warning' | 'indigo';
}) {
    const iconClassName =
        tone === 'success'
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            : tone === 'warning'
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
              : tone === 'indigo'
                ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                : 'bg-primary/10 text-primary';

    return (
        <div className="rounded-2xl border border-border/70 bg-background p-4">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-[10px] font-semibold tracking-[0.13em] text-muted-foreground uppercase">
                        {label}
                    </p>

                    <p className="mt-2 text-2xl font-bold tracking-tight">
                        {value.toLocaleString()}
                    </p>

                    <p
                        className="mt-1 truncate text-[11px] text-muted-foreground"
                        title={description}
                    >
                        {description}
                    </p>
                </div>

                <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}

function Field({
    label,
    children,
    hint,
    required = false,
}: {
    label: string;
    children: ReactNode;
    hint?: string;
    required?: boolean;
}) {
    return (
        <div className="space-y-2">
            <Label className="text-xs font-medium">
                {label}

                {required && (
                    <span className="ml-1 text-destructive">*</span>
                )}
            </Label>

            {children}

            {hint && (
                <p className="text-[11px] leading-4 text-muted-foreground">
                    {hint}
                </p>
            )}
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
    mono = false,
}: {
    label: string;
    value: string;
    mono?: boolean;
}) {
    return (
        <div className="flex items-start justify-between gap-4 border-b border-border/60 py-3 first:pt-0 last:border-b-0 last:pb-0">
            <span className="text-xs text-muted-foreground">
                {label}
            </span>

            <span
                className={[
                    'max-w-[65%] break-words text-right text-xs font-semibold text-foreground',
                    mono ? 'font-mono' : '',
                ].join(' ')}
            >
                {value}
            </span>
        </div>
    );
}

function DrawerActions({ children }: { children: ReactNode }) {
    return (
        <div className="flex items-center justify-end gap-2 border-t border-border pt-5">
            {children}
        </div>
    );
}

function EmptyDirectory({
    icon,
    title,
    description,
}: {
    icon: ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/10 px-6 py-10 text-center">
            <div className="flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                {icon}
            </div>

            <p className="mt-4 text-sm font-semibold">{title}</p>

            <p className="mt-1 max-w-md text-xs leading-5 text-muted-foreground">
                {description}
            </p>
        </div>
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