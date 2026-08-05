import { SectionCard } from '@/components/admin-ui/section-card';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import {
    BadgeCheck,
    Blocks,
    Check,
    ChevronRight,
    CircleSlash2,
    Code2,
    Layers3,
    LockKeyhole,
    Plus,
    RefreshCw,
    ShieldCheck,
    Trash2,
    UserCog,
    UsersRound,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';

type Product = {
    id: number;
    name: string;
};

type Feature = {
    id: number;
    feature_code: string;
    name: string;
    description?: string | null;
    is_developer_ready: boolean;
    sort_order: number;
    status: string;
};

type Role = {
    id: number;
    display_name?: string | null;
    type_code: string;
    base_name: string;
    is_owner_type: boolean;
    status: string;
};

type Plan = {
    id: number;
    plan_name: string;
};

type BaseUserType = {
    id: number;
    name: string;
    type_code: string;
};

type PlanFeature = {
    plan_id: number;
    feature_id: number;
    is_enabled: boolean;
};

type PlanRole = {
    plan_id: number;
    product_user_type_id: number;
    is_enabled: boolean;
    max_accounts?: number | null;
};

type Props = {
    selectedProductId: number;
    products: Product[];
    features: Feature[];
    roles: Role[];
    plans: Plan[];
    baseUserTypes: BaseUserType[];
    planFeatures: PlanFeature[];
    planRoles: PlanRole[];
};

type CapabilityFormData = {
    product_id: string;
    feature_code: string;
    name: string;
    description: string;
    is_developer_ready: boolean;
    sort_order: number;
    status: string;
};

type RoleFormData = {
    product_id: string;
    user_type_id: string;
    display_name: string;
    status: string;
};

type DrawerState =
    | { type: 'create-capability' }
    | { type: 'capability-details'; feature: Feature }
    | { type: 'create-role' }
    | { type: 'role-details'; role: Role }
    | null;

type WorkspaceTab = 'capabilities' | 'roles' | 'matrix';
type MatrixTab = 'capabilities' | 'roles';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Systems Management',
        href: '/admin/systems',
    },
    {
        title: 'Modules & Capabilities',
        href: '/admin/modules',
    },
];

const selectClassName =
    'h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary/60 focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60';

export default function ModulesAndCapabilities(props: Props) {
    const [drawer, setDrawer] = useState<DrawerState>(null);
    const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>('capabilities');
    const [matrixTab, setMatrixTab] = useState<MatrixTab>('capabilities');

    const selectedProduct = useMemo(
        () => props.products.find((product) => product.id === props.selectedProductId),
        [props.products, props.selectedProductId],
    );

    const activeFeatures = useMemo(() => props.features.filter((feature) => feature.status.toLowerCase() === 'active').length, [props.features]);

    const readyFeatures = useMemo(() => props.features.filter((feature) => feature.is_developer_ready).length, [props.features]);

    const activeRoles = useMemo(() => props.roles.filter((role) => role.status.toLowerCase() === 'active').length, [props.roles]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Modules & Capabilities" />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-foreground text-2xl font-bold tracking-tight">Modules & Capabilities</h1>

                        <p className="text-muted-foreground mt-1 max-w-3xl text-sm leading-6">
                            Configure system capabilities, reusable product roles, and plan-level access.
                        </p>
                    </div>

                    <div className="w-full lg:w-72">
                        <Label className="mb-2 block text-xs font-medium">Selected JCM system</Label>

                        <select
                            className={selectClassName}
                            value={props.selectedProductId}
                            onChange={(event) =>
                                router.get(
                                    '/admin/modules',
                                    {
                                        product_id: event.target.value,
                                    },
                                    {
                                        preserveState: false,
                                        replace: true,
                                    },
                                )
                            }
                        >
                            {props.products.map((product) => (
                                <option key={product.id} value={product.id}>
                                    {product.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        icon={<Blocks className="size-5" />}
                        label="Capabilities"
                        value={props.features.length}
                        description={`${activeFeatures} active`}
                    />

                    <SummaryCard
                        icon={<Code2 className="size-5" />}
                        label="Developer ready"
                        value={readyFeatures}
                        description="Ready for plan access"
                        tone="success"
                    />

                    <SummaryCard
                        icon={<UsersRound className="size-5" />}
                        label="Product roles"
                        value={props.roles.length}
                        description={`${activeRoles} active`}
                        tone="warning"
                    />

                    <SummaryCard
                        icon={<Layers3 className="size-5" />}
                        label="Active plans"
                        value={props.plans.length}
                        description={selectedProduct?.name ?? 'Current system'}
                        tone="indigo"
                    />
                </div>

                <WorkspaceTabs
                    activeTab={workspaceTab}
                    capabilityCount={props.features.length}
                    roleCount={props.roles.length}
                    planCount={props.plans.length}
                    onChange={setWorkspaceTab}
                />

                {workspaceTab === 'capabilities' && (
                    <SectionCard
                        title="Capabilities"
                        description="Manage system modules and click a row to view its complete configuration."
                        actions={
                            <Button
                                type="button"
                                size="sm"
                                className="rounded-xl"
                                onClick={() =>
                                    setDrawer({
                                        type: 'create-capability',
                                    })
                                }
                            >
                                <Plus className="size-4" />
                                New capability
                            </Button>
                        }
                    >
                        <CompactCapabilityList
                            features={props.features}
                            onSelect={(feature) =>
                                setDrawer({
                                    type: 'capability-details',
                                    feature,
                                })
                            }
                        />
                    </SectionCard>
                )}

                {workspaceTab === 'roles' && (
                    <SectionCard
                        title="Product roles"
                        description="Manage reusable account roles and click a row to review its complete configuration."
                        actions={
                            <Button
                                type="button"
                                size="sm"
                                className="rounded-xl"
                                onClick={() =>
                                    setDrawer({
                                        type: 'create-role',
                                    })
                                }
                            >
                                <Plus className="size-4" />
                                Add role
                            </Button>
                        }
                    >
                        <CompactRoleList
                            roles={props.roles}
                            onSelect={(role) =>
                                setDrawer({
                                    type: 'role-details',
                                    role,
                                })
                            }
                        />
                    </SectionCard>
                )}

                {workspaceTab === 'matrix' && (
                    <SectionCard
                        title="Plan access matrix"
                        description="Enable or disable capabilities and account roles for every subscription plan."
                        actions={
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    className={[
                                        'rounded-md px-3 py-1.5 text-xs font-medium transition',
                                        matrixTab === 'capabilities' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground',
                                    ].join(' ')}
                                    onClick={() => setMatrixTab('capabilities')}
                                >
                                    Capabilities
                                </button>

                                <button
                                    type="button"
                                    className={[
                                        'rounded-md px-3 py-1.5 text-xs font-medium transition',
                                        matrixTab === 'roles' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground',
                                    ].join(' ')}
                                    onClick={() => setMatrixTab('roles')}
                                >
                                    Product roles
                                </button>
                            </div>
                        }
                    >
                        {matrixTab === 'capabilities' ? (
                            <CapabilityMatrix
                                selectedProductId={props.selectedProductId}
                                features={props.features}
                                plans={props.plans}
                                planFeatures={props.planFeatures}
                            />
                        ) : (
                            <RoleMatrix
                                selectedProductId={props.selectedProductId}
                                roles={props.roles}
                                plans={props.plans}
                                planRoles={props.planRoles}
                            />
                        )}
                    </SectionCard>
                )}
            </div>

            {drawer?.type === 'create-capability' && (
                <CreateCapabilityDrawer selectedProductId={props.selectedProductId} onClose={() => setDrawer(null)} />
            )}

            {drawer?.type === 'capability-details' && (
                <CapabilityDetailsDrawer
                    feature={drawer.feature}
                    plans={props.plans}
                    planFeatures={props.planFeatures}
                    onClose={() => setDrawer(null)}
                />
            )}

            {drawer?.type === 'create-role' && (
                <CreateRoleDrawer selectedProductId={props.selectedProductId} baseUserTypes={props.baseUserTypes} onClose={() => setDrawer(null)} />
            )}

            {drawer?.type === 'role-details' && (
                <RoleDetailsDrawer role={drawer.role} plans={props.plans} planRoles={props.planRoles} onClose={() => setDrawer(null)} />
            )}
        </AppLayout>
    );
}

function WorkspaceTabs({
    activeTab,
    capabilityCount,
    roleCount,
    planCount,
    onChange,
}: {
    activeTab: WorkspaceTab;
    capabilityCount: number;
    roleCount: number;
    planCount: number;
    onChange: (tab: WorkspaceTab) => void;
}) {
    const tabs: {
        key: WorkspaceTab;
        label: string;
        description: string;
        count: number;
        icon: ReactNode;
    }[] = [
        {
            key: 'capabilities',
            label: 'Capabilities',
            description: 'Modules and permissions',
            count: capabilityCount,
            icon: <Blocks className="size-4" />,
        },
        {
            key: 'roles',
            label: 'Product Roles',
            description: 'Account role definitions',
            count: roleCount,
            icon: <UsersRound className="size-4" />,
        },
        {
            key: 'matrix',
            label: 'Plan Access Matrix',
            description: 'Plan entitlements',
            count: planCount,
            icon: <Layers3 className="size-4" />,
        },
    ];

    return (
        <nav className="border-border/70 border-b" aria-label="Modules workspace">
            <div className="flex gap-7 overflow-x-auto">
                {tabs.map((tab) => {
                    const active = activeTab === tab.key;

                    return (
                        <button
                            key={tab.key}
                            type="button"
                            className={[
                                'group relative flex min-w-max items-center gap-2.5 px-0.5 pt-1 pb-3 text-left transition',
                                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                            ].join(' ')}
                            onClick={() => onChange(tab.key)}
                            aria-current={active ? 'page' : undefined}
                        >
                            <span className={['transition', active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'].join(' ')}>
                                {tab.icon}
                            </span>

                            <span>
                                <span className="block text-xs font-semibold">{tab.label}</span>

                                <span className="text-muted-foreground mt-0.5 block text-[10px]">{tab.description}</span>
                            </span>

                            <span
                                className={[
                                    'ml-1 rounded-full px-2 py-0.5 text-[9px] font-bold transition',
                                    active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
                                ].join(' ')}
                            >
                                {tab.count.toLocaleString()}
                            </span>

                            <span
                                className={[
                                    'absolute inset-x-0 -bottom-px h-0.5 rounded-full transition',
                                    active ? 'bg-primary' : 'group-hover:bg-border bg-transparent',
                                ].join(' ')}
                            />
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}

function CompactCapabilityList({ features, onSelect }: { features: Feature[]; onSelect: (feature: Feature) => void }) {
    if (features.length === 0) {
        return (
            <EmptyDirectory
                icon={<Blocks className="size-5" />}
                title="No capabilities configured"
                description="Create the first capability for this system."
            />
        );
    }

    return (
        <div className="divide-border/60 divide-y">
            {features.map((feature) => (
                <button
                    key={feature.id}
                    type="button"
                    className="group hover:bg-muted/20 flex w-full items-center gap-3 px-1 py-3 text-left transition"
                    onClick={() => onSelect(feature)}
                >
                    <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
                        <Blocks className="size-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="text-foreground truncate text-sm font-semibold">{feature.name}</p>

                        <p className="text-muted-foreground mt-0.5 truncate font-mono text-[10px]">{feature.feature_code}</p>
                    </div>

                    <div className="hidden items-center gap-2 sm:flex">
                        <StatusBadge status={feature.status} />

                        <span
                            className={[
                                'rounded-full px-2 py-0.5 text-[9px] font-semibold',
                                feature.is_developer_ready ? 'bg-primary/10 text-primary' : 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
                            ].join(' ')}
                        >
                            {feature.is_developer_ready ? 'Ready' : 'Not ready'}
                        </span>
                    </div>

                    <ChevronRight className="text-muted-foreground group-hover:text-foreground size-4 shrink-0 transition group-hover:translate-x-0.5" />
                </button>
            ))}
        </div>
    );
}

function CompactRoleList({ roles, onSelect }: { roles: Role[]; onSelect: (role: Role) => void }) {
    if (roles.length === 0) {
        return (
            <EmptyDirectory
                icon={<UsersRound className="size-5" />}
                title="No product roles configured"
                description="Add the first account role for this system."
            />
        );
    }

    return (
        <div className="divide-border/60 divide-y">
            {roles.map((role) => (
                <button
                    key={role.id}
                    type="button"
                    className="group hover:bg-muted/20 flex w-full items-center gap-3 px-1 py-3 text-left transition"
                    onClick={() => onSelect(role)}
                >
                    <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
                        {role.is_owner_type ? <ShieldCheck className="size-4" /> : <UserCog className="size-4" />}
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="text-foreground truncate text-sm font-semibold">{role.display_name || role.base_name}</p>

                        <p className="text-muted-foreground mt-0.5 truncate font-mono text-[10px]">{role.type_code}</p>
                    </div>

                    <div className="hidden items-center gap-2 sm:flex">
                        <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[9px] font-semibold">
                            {role.is_owner_type ? 'Owner' : 'Team'}
                        </span>

                        <StatusBadge status={role.status} />
                    </div>

                    <ChevronRight className="text-muted-foreground group-hover:text-foreground size-4 shrink-0 transition group-hover:translate-x-0.5" />
                </button>
            ))}
        </div>
    );
}

function CreateCapabilityDrawer({ selectedProductId, onClose }: { selectedProductId: number; onClose: () => void }) {
    const form = useForm<CapabilityFormData>({
        product_id: String(selectedProductId),
        feature_code: '',
        name: '',
        description: '',
        is_developer_ready: true,
        sort_order: 0,
        status: 'active',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.post('/admin/modules/features', {
            preserveScroll: true,
            onSuccess: onClose,
        });
    };

    return (
        <DetailDrawer title="Create capability" description="Register a new module or product entitlement." onClose={onClose}>
            <form onSubmit={submit} className="space-y-5">
                <Field label="Capability code" required>
                    <Input
                        value={form.data.feature_code}
                        onChange={(event) => form.setData('feature_code', event.target.value)}
                        placeholder="inventory_reports"
                    />

                    <InputError message={form.errors.feature_code} />
                </Field>

                <Field label="Capability name" required>
                    <Input value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} placeholder="Inventory Reports" />

                    <InputError message={form.errors.name} />
                </Field>

                <Field label="Description">
                    <textarea
                        className="border-input bg-background placeholder:text-muted-foreground focus:border-primary/60 focus:ring-primary/10 min-h-28 w-full resize-y rounded-xl border px-3 py-3 text-sm transition outline-none focus:ring-4"
                        value={form.data.description}
                        onChange={(event) => form.setData('description', event.target.value)}
                        placeholder="Describe what this capability enables."
                    />

                    <InputError message={form.errors.description} />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Sort order">
                        <Input
                            type="number"
                            min={0}
                            value={form.data.sort_order}
                            onChange={(event) => form.setData('sort_order', Number(event.target.value || 0))}
                        />

                        <InputError message={form.errors.sort_order} />
                    </Field>

                    <Field label="Status">
                        <select className={selectClassName} value={form.data.status} onChange={(event) => form.setData('status', event.target.value)}>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>

                        <InputError message={form.errors.status} />
                    </Field>
                </div>

                <label className="border-border/70 bg-muted/20 flex cursor-pointer items-start gap-3 rounded-xl border p-4">
                    <input
                        type="checkbox"
                        className="border-border text-primary focus:ring-primary mt-0.5 size-4 rounded"
                        checked={form.data.is_developer_ready}
                        onChange={(event) => form.setData('is_developer_ready', event.target.checked)}
                    />

                    <span>
                        <span className="block text-xs font-semibold">Developer ready</span>

                        <span className="text-muted-foreground mt-1 block text-[11px] leading-4">
                            Mark this when the module is implemented and safe to enable for subscribers.
                        </span>
                    </span>
                </label>

                <DrawerActions>
                    <Button type="button" variant="outline" onClick={onClose} disabled={form.processing}>
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
                                Create capability
                            </>
                        )}
                    </Button>
                </DrawerActions>
            </form>
        </DetailDrawer>
    );
}

function CapabilityDetailsDrawer({
    feature,
    plans,
    planFeatures,
    onClose,
}: {
    feature: Feature;
    plans: Plan[];
    planFeatures: PlanFeature[];
    onClose: () => void;
}) {
    const remove = () => {
        const confirmed = window.confirm(`Delete the capability "${feature.name}"?`);

        if (!confirmed) {
            return;
        }

        router.delete(`/admin/modules/features/${feature.id}`, {
            preserveScroll: true,
            onSuccess: onClose,
        });
    };

    return (
        <DetailDrawer title={feature.name} description="Capability configuration and plan availability." onClose={onClose}>
            <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={feature.status} />

                    <span
                        className={[
                            'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase',
                            feature.is_developer_ready
                                ? 'border-primary/20 bg-primary/10 text-primary'
                                : 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400',
                        ].join(' ')}
                    >
                        {feature.is_developer_ready ? <BadgeCheck className="size-3" /> : <CircleSlash2 className="size-3" />}

                        {feature.is_developer_ready ? 'Developer ready' : 'Not ready'}
                    </span>
                </div>

                <DetailSection title="Capability details">
                    <DetailRow label="Capability code" value={feature.feature_code} mono />

                    <DetailRow label="Sort order" value={String(feature.sort_order)} />

                    <DetailRow label="Status" value={formatLabel(feature.status)} />
                </DetailSection>

                <DetailSection title="Description">
                    <p className="text-muted-foreground text-sm leading-6">
                        {feature.description || 'No description has been provided for this capability.'}
                    </p>
                </DetailSection>

                <DetailSection title="Plan availability">
                    {plans.length === 0 ? (
                        <p className="text-muted-foreground text-xs">No active plans are available.</p>
                    ) : (
                        <div className="space-y-2">
                            {plans.map((plan) => {
                                const enabled =
                                    planFeatures.find((item) => item.plan_id === plan.id && item.feature_id === feature.id)?.is_enabled ?? false;

                                return (
                                    <div
                                        key={plan.id}
                                        className="border-border/60 flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5"
                                    >
                                        <span className="text-xs font-medium">{plan.plan_name}</span>

                                        <EntitlementBadge enabled={enabled} enabledLabel="Included" disabledLabel="Excluded" />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </DetailSection>

                <div className="border-border border-t pt-5">
                    <Button
                        type="button"
                        variant="outline"
                        className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive w-full"
                        onClick={remove}
                    >
                        <Trash2 className="size-4" />
                        Delete capability
                    </Button>
                </div>
            </div>
        </DetailDrawer>
    );
}

function CreateRoleDrawer({
    selectedProductId,
    baseUserTypes,
    onClose,
}: {
    selectedProductId: number;
    baseUserTypes: BaseUserType[];
    onClose: () => void;
}) {
    const form = useForm<RoleFormData>({
        product_id: String(selectedProductId),
        user_type_id: '',
        display_name: '',
        status: 'active',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.post('/admin/modules/roles', {
            preserveScroll: true,
            onSuccess: onClose,
        });
    };

    return (
        <DetailDrawer title="Add product role" description="Map a reusable platform user type to this system." onClose={onClose}>
            <form onSubmit={submit} className="space-y-5">
                <Field label="Base user type" required>
                    <select
                        className={selectClassName}
                        value={form.data.user_type_id}
                        onChange={(event) => form.setData('user_type_id', event.target.value)}
                    >
                        <option value="">Select base user type</option>

                        {baseUserTypes.map((type) => (
                            <option key={type.id} value={type.id}>
                                {type.name} — {type.type_code}
                            </option>
                        ))}
                    </select>

                    <InputError message={form.errors.user_type_id} />
                </Field>

                <Field label="Display name" hint="Leave blank to use the base user type name.">
                    <Input
                        value={form.data.display_name}
                        onChange={(event) => form.setData('display_name', event.target.value)}
                        placeholder="Inventory Manager"
                    />

                    <InputError message={form.errors.display_name} />
                </Field>

                <Field label="Status">
                    <select className={selectClassName} value={form.data.status} onChange={(event) => form.setData('status', event.target.value)}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>

                    <InputError message={form.errors.status} />
                </Field>

                <DrawerActions>
                    <Button type="button" variant="outline" onClick={onClose} disabled={form.processing}>
                        Cancel
                    </Button>

                    <Button type="submit" disabled={form.processing}>
                        {form.processing ? (
                            <>
                                <RefreshCw className="size-4 animate-spin" />
                                Adding...
                            </>
                        ) : (
                            <>
                                <Plus className="size-4" />
                                Add product role
                            </>
                        )}
                    </Button>
                </DrawerActions>
            </form>
        </DetailDrawer>
    );
}

function RoleDetailsDrawer({ role, plans, planRoles, onClose }: { role: Role; plans: Plan[]; planRoles: PlanRole[]; onClose: () => void }) {
    const roleName = role.display_name || role.base_name;

    const remove = () => {
        const confirmed = window.confirm(`Delete the product role "${roleName}"?`);

        if (!confirmed) {
            return;
        }

        router.delete(`/admin/modules/roles/${role.id}`, {
            preserveScroll: true,
            onSuccess: onClose,
        });
    };

    return (
        <DetailDrawer title={roleName} description="Product role configuration and plan availability." onClose={onClose}>
            <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={role.status} />

                    <span className="border-border bg-muted/30 text-muted-foreground rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase">
                        {role.is_owner_type ? 'Owner role' : 'Team role'}
                    </span>
                </div>

                <DetailSection title="Role details">
                    <DetailRow label="Display name" value={roleName} />

                    <DetailRow label="Base user type" value={role.base_name} />

                    <DetailRow label="Type code" value={role.type_code} mono />

                    <DetailRow label="Authority" value={role.is_owner_type ? 'Account owner' : 'Delegated team member'} />
                </DetailSection>

                <DetailSection title="Plan availability">
                    {plans.length === 0 ? (
                        <p className="text-muted-foreground text-xs">No active plans are available.</p>
                    ) : (
                        <div className="space-y-2">
                            {plans.map((plan) => {
                                const assignment = planRoles.find((item) => item.plan_id === plan.id && item.product_user_type_id === role.id);

                                const enabled = assignment?.is_enabled ?? false;

                                return (
                                    <div
                                        key={plan.id}
                                        className="border-border/60 flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5"
                                    >
                                        <div>
                                            <p className="text-xs font-medium">{plan.plan_name}</p>

                                            {enabled && assignment?.max_accounts != null && (
                                                <p className="text-muted-foreground mt-0.5 text-[10px]">
                                                    Maximum {assignment.max_accounts} account
                                                    {assignment.max_accounts === 1 ? '' : 's'}
                                                </p>
                                            )}
                                        </div>

                                        <EntitlementBadge enabled={enabled} enabledLabel="Allowed" disabledLabel="Blocked" />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </DetailSection>

                <div className="border-border border-t pt-5">
                    <Button
                        type="button"
                        variant="outline"
                        className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive w-full"
                        onClick={remove}
                    >
                        <Trash2 className="size-4" />
                        Delete product role
                    </Button>
                </div>
            </div>
        </DetailDrawer>
    );
}

function CapabilityMatrix({
    selectedProductId,
    features,
    plans,
    planFeatures,
}: {
    selectedProductId: number;
    features: Feature[];
    plans: Plan[];
    planFeatures: PlanFeature[];
}) {
    if (plans.length === 0 || features.length === 0) {
        return (
            <EmptyDirectory
                icon={<Layers3 className="size-5" />}
                title="Capability matrix unavailable"
                description="Create at least one plan and one capability."
            />
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
                <thead>
                    <tr className="border-border/70 bg-muted/20 border-y">
                        <MatrixHeading sticky>Capability</MatrixHeading>

                        {plans.map((plan) => (
                            <MatrixHeading key={plan.id} centered>
                                {plan.plan_name}
                            </MatrixHeading>
                        ))}
                    </tr>
                </thead>

                <tbody className="divide-border/50 divide-y">
                    {features.map((feature) => (
                        <tr key={feature.id} className="hover:bg-muted/15 transition">
                            <td className="bg-background/95 sticky left-0 z-10 px-4 py-3 backdrop-blur">
                                <p className="text-xs font-semibold">{feature.name}</p>

                                <p className="text-muted-foreground mt-1 font-mono text-[9px]">{feature.feature_code}</p>
                            </td>

                            {plans.map((plan) => {
                                const enabled =
                                    planFeatures.find((item) => item.plan_id === plan.id && item.feature_id === feature.id)?.is_enabled ?? false;

                                return (
                                    <td key={plan.id} className="px-4 py-3 text-center">
                                        <EntitlementButton
                                            enabled={enabled}
                                            enabledLabel="Included"
                                            disabledLabel="Excluded"
                                            onClick={() =>
                                                router.post(
                                                    '/admin/modules/plan-feature',
                                                    {
                                                        product_id: selectedProductId,
                                                        plan_id: plan.id,
                                                        feature_id: feature.id,
                                                        is_enabled: !enabled,
                                                    },
                                                    {
                                                        preserveScroll: true,
                                                    },
                                                )
                                            }
                                        />
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function RoleMatrix({
    selectedProductId,
    roles,
    plans,
    planRoles,
}: {
    selectedProductId: number;
    roles: Role[];
    plans: Plan[];
    planRoles: PlanRole[];
}) {
    if (plans.length === 0 || roles.length === 0) {
        return (
            <EmptyDirectory
                icon={<LockKeyhole className="size-5" />}
                title="Role matrix unavailable"
                description="Create at least one plan and one product role."
            />
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
                <thead>
                    <tr className="border-border/70 bg-muted/20 border-y">
                        <MatrixHeading sticky>Product role</MatrixHeading>

                        {plans.map((plan) => (
                            <MatrixHeading key={plan.id} centered>
                                {plan.plan_name}
                            </MatrixHeading>
                        ))}
                    </tr>
                </thead>

                <tbody className="divide-border/50 divide-y">
                    {roles.map((role) => (
                        <tr key={role.id} className="hover:bg-muted/15 transition">
                            <td className="bg-background/95 sticky left-0 z-10 px-4 py-3 backdrop-blur">
                                <p className="text-xs font-semibold">{role.display_name || role.base_name}</p>

                                <p className="text-muted-foreground mt-1 font-mono text-[9px]">{role.type_code}</p>
                            </td>

                            {plans.map((plan) => {
                                const assignment = planRoles.find((item) => item.plan_id === plan.id && item.product_user_type_id === role.id);

                                const enabled = assignment?.is_enabled ?? false;

                                return (
                                    <td key={plan.id} className="px-4 py-3 text-center">
                                        <EntitlementButton
                                            enabled={enabled}
                                            enabledLabel="Allowed"
                                            disabledLabel="Blocked"
                                            onClick={() =>
                                                router.post(
                                                    '/admin/modules/plan-role',
                                                    {
                                                        product_id: selectedProductId,
                                                        plan_id: plan.id,
                                                        product_user_type_id: role.id,
                                                        is_enabled: !enabled,
                                                        max_accounts: assignment?.max_accounts ?? null,
                                                    },
                                                    {
                                                        preserveScroll: true,
                                                    },
                                                )
                                            }
                                        />
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function DetailDrawer({ title, description, children, onClose }: { title: string; description?: string; children: ReactNode; onClose: () => void }) {
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
            <button type="button" className="absolute inset-0 bg-black/45 backdrop-blur-[1px]" onClick={onClose} aria-label="Close drawer" />

            <aside className="border-border bg-background absolute top-0 right-0 flex h-full w-full max-w-xl flex-col border-l shadow-2xl">
                <div className="border-border flex items-start justify-between gap-4 border-b px-5 py-4 sm:px-6">
                    <div className="min-w-0">
                        <h2 className="text-foreground truncate text-lg font-semibold">{title}</h2>

                        {description && <p className="text-muted-foreground mt-1 text-xs leading-5">{description}</p>}
                    </div>

                    <Button type="button" size="icon" variant="ghost" className="shrink-0 rounded-xl" onClick={onClose} aria-label="Close drawer">
                        <X className="size-4" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
            </aside>
        </div>
    );
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section>
            <h3 className="text-muted-foreground mb-3 text-[10px] font-bold tracking-[0.14em] uppercase">{title}</h3>

            {children}
        </section>
    );
}

function DetailRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
    return (
        <div className="border-border/60 flex items-start justify-between gap-4 border-b py-3 first:pt-0 last:border-b-0 last:pb-0">
            <span className="text-muted-foreground text-xs">{label}</span>

            <span className={['text-foreground max-w-[65%] text-right text-xs font-semibold', mono ? 'font-mono' : ''].join(' ')}>{value}</span>
        </div>
    );
}

function DrawerActions({ children }: { children: ReactNode }) {
    return <div className="border-border flex items-center justify-end gap-2 border-t pt-5">{children}</div>;
}

function Field({ label, children, hint, required = false }: { label: string; children: ReactNode; hint?: string; required?: boolean }) {
    return (
        <div className="space-y-2">
            <Label className="text-xs font-medium">
                {label}

                {required && <span className="text-destructive ml-1">*</span>}
            </Label>

            {children}

            {hint && <p className="text-muted-foreground text-[11px] leading-4">{hint}</p>}
        </div>
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
        <div className="border-border/70 bg-background rounded-2xl border p-4">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.13em] uppercase">{label}</p>

                    <p className="mt-2 text-2xl font-bold tracking-tight">{value.toLocaleString()}</p>

                    <p className="text-muted-foreground mt-1 text-[11px]">{description}</p>
                </div>

                <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}>{icon}</div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const active = status.toLowerCase() === 'active';

    return (
        <span
            className={[
                'rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase',
                active
                    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    : 'border-border bg-muted text-muted-foreground',
            ].join(' ')}
        >
            {formatLabel(status)}
        </span>
    );
}

function EntitlementBadge({ enabled, enabledLabel, disabledLabel }: { enabled: boolean; enabledLabel: string; disabledLabel: string }) {
    return (
        <span
            className={[
                'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase',
                enabled
                    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    : 'border-border bg-muted text-muted-foreground',
            ].join(' ')}
        >
            {enabled ? <Check className="size-3" /> : <X className="size-3" />}

            {enabled ? enabledLabel : disabledLabel}
        </span>
    );
}

function EntitlementButton({
    enabled,
    enabledLabel,
    disabledLabel,
    onClick,
}: {
    enabled: boolean;
    enabledLabel: string;
    disabledLabel: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                'inline-flex min-w-24 items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 text-[9px] font-bold uppercase transition',
                enabled
                    ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-400'
                    : 'border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground',
            ].join(' ')}
        >
            {enabled ? <Check className="size-3" /> : <X className="size-3" />}

            {enabled ? enabledLabel : disabledLabel}
        </button>
    );
}

function MatrixHeading({ children, sticky = false, centered = false }: { children: ReactNode; sticky?: boolean; centered?: boolean }) {
    return (
        <th
            className={[
                'text-muted-foreground min-w-40 px-4 py-3 text-[10px] font-semibold tracking-[0.12em] uppercase',
                sticky ? 'bg-muted/95 sticky left-0 z-10 min-w-64 backdrop-blur' : '',
                centered ? 'text-center' : 'text-left',
            ].join(' ')}
        >
            {children}
        </th>
    );
}

function EmptyDirectory({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
    return (
        <div className="border-border bg-muted/10 flex min-h-44 flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-10 text-center">
            <div className="bg-muted text-muted-foreground flex size-11 items-center justify-center rounded-xl">{icon}</div>

            <p className="mt-4 text-sm font-semibold">{title}</p>

            <p className="text-muted-foreground mt-1 max-w-md text-xs leading-5">{description}</p>
        </div>
    );
}

function formatLabel(value?: string | null) {
    if (!value) {
        return 'None';
    }

    return value.replace(/[_-]+/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());
}