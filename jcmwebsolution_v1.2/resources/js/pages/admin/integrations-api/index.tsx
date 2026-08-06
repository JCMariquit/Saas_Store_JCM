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
import axios from 'axios';
import {
    Activity,
    Copy,
    Eye,
    KeyRound,
    PlugZap,
    Plus,
    RefreshCw,
    Search,
    ServerCog,
    Trash2,
} from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';

type Integration = {
    id: number;
    name: string;
    integration_code: string;
    provider: string;
    base_url?: string | null;
    webhook_url?: string | null;
    environment: string;
    status: string;
    scopes: string[];
    secret_last_four?: string | null;
    last_used_at?: string | null;
    created_at: string;
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
    integrations: Paginated<Integration>;
    stats: {
        total: number;
        active: number;
        sandbox: number;
        production: number;
    };
    filters: {
        search?: string;
        status?: string;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Systems', href: '/admin/systems' },
    { title: 'Integrations & API', href: '/admin/integrations-api' },
];

const scopeOptions = [
    'read:users',
    'write:users',
    'read:products',
    'write:products',
    'read:subscriptions',
    'write:subscriptions',
    'read:orders',
    'write:orders',
    'webhooks:receive',
];

export default function IntegrationsApi({
    integrations,
    stats,
    filters,
}: Props) {
    const [createOpen, setCreateOpen] = useState(false);
    const [selected, setSelected] = useState<Integration | null>(
        null,
    );
    const [revealedSecret, setRevealedSecret] = useState('');
    const [revealing, setRevealing] = useState(false);
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    const createForm = useForm({
        name: '',
        integration_code: '',
        provider: '',
        base_url: '',
        webhook_url: '',
        environment: 'sandbox',
        status: 'active',
        scopes: [] as string[],
    });

    const editForm = useForm({
        name: selected?.name ?? '',
        provider: selected?.provider ?? '',
        base_url: selected?.base_url ?? '',
        webhook_url: selected?.webhook_url ?? '',
        environment: selected?.environment ?? 'sandbox',
        status: selected?.status ?? 'active',
        scopes: selected?.scopes ?? ([] as string[]),
    });

    const selectedScopeText = useMemo(
        () => selected?.scopes.join(', ') || 'No scopes assigned',
        [selected],
    );

    function submitFilter(event: FormEvent) {
        event.preventDefault();
        router.get(
            '/admin/integrations-api',
            { search, status },
            { preserveState: true, replace: true },
        );
    }

    function openDetails(item: Integration) {
        setSelected(item);
        setRevealedSecret('');
        editForm.setData({
            name: item.name,
            provider: item.provider,
            base_url: item.base_url ?? '',
            webhook_url: item.webhook_url ?? '',
            environment: item.environment,
            status: item.status,
            scopes: item.scopes,
        });
    }

    async function revealSecret() {
        if (!selected) return;
        setRevealing(true);

        try {
            const response = await axios.get(
                `/admin/integrations-api/${selected.id}/reveal`,
            );
            setRevealedSecret(response.data.secret ?? '');
        } finally {
            setRevealing(false);
        }
    }

    function toggleScope(
        scope: string,
        current: string[],
        apply: (scopes: string[]) => void,
    ) {
        apply(
            current.includes(scope)
                ? current.filter((value) => value !== scope)
                : [...current, scope],
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Integrations & API" />

            <div className="space-y-5">
                <ModulePageHeader
                    eyebrow="Platform Connectivity"
                    title="Integrations & API"
                    description="Manage external services, webhook destinations, environments, scopes, and securely stored API credentials."
                    actions={
                        <Button
                            type="button"
                            onClick={() => setCreateOpen(true)}
                            className="rounded-xl"
                        >
                            <Plus className="size-4" />
                            Add integration
                        </Button>
                    }
                />

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <ModuleMetric
                        label="Integrations"
                        value={stats.total}
                        hint="Configured connections"
                        icon={PlugZap}
                    />
                    <ModuleMetric
                        label="Active"
                        value={stats.active}
                        hint="Available credentials"
                        icon={Activity}
                    />
                    <ModuleMetric
                        label="Sandbox"
                        value={stats.sandbox}
                        hint="Test environments"
                        icon={ServerCog}
                    />
                    <ModuleMetric
                        label="Production"
                        value={stats.production}
                        hint="Live integrations"
                        icon={KeyRound}
                    />
                </div>

                <section className="border-border/70 bg-card overflow-hidden rounded-2xl border shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
                    <div className="border-border/70 flex flex-col gap-3 border-b px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-foreground text-sm font-semibold">
                                Integration directory
                            </h2>
                            <p className="text-muted-foreground mt-1 text-xs">
                                Click a row to review credentials and configuration.
                            </p>
                        </div>

                        <form
                            onSubmit={submitFilter}
                            className="flex flex-col gap-2 sm:flex-row"
                        >
                            <div className="relative">
                                <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                                <input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Search integrations..."
                                    className={`${inputClassName} sm:w-64 pl-9`}
                                />
                            </div>

                            <select
                                value={status}
                                onChange={(event) =>
                                    setStatus(event.target.value)
                                }
                                className={`${selectClassName} sm:w-40`}
                            >
                                <option value="">All statuses</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="error">Error</option>
                            </select>

                            <Button type="submit" variant="outline">
                                Apply
                            </Button>
                        </form>
                    </div>

                    {integrations.data.length === 0 ? (
                        <ModuleEmpty
                            icon={PlugZap}
                            title="No integrations found"
                            description="Create the first API connection or adjust the current filters."
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px] text-left text-xs">
                                <thead>
                                    <tr className="border-border/70 text-muted-foreground border-b">
                                        <th className="px-4 py-3 font-semibold">
                                            Integration
                                        </th>
                                        <th className="px-4 py-3 font-semibold">
                                            Provider
                                        </th>
                                        <th className="px-4 py-3 font-semibold">
                                            Environment
                                        </th>
                                        <th className="px-4 py-3 font-semibold">
                                            Scopes
                                        </th>
                                        <th className="px-4 py-3 font-semibold">
                                            Credential
                                        </th>
                                        <th className="px-4 py-3 font-semibold">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {integrations.data.map((item) => (
                                        <tr
                                            key={item.id}
                                            onClick={() => openDetails(item)}
                                            className="border-border/60 hover:bg-primary/[0.035] cursor-pointer border-b last:border-b-0"
                                        >
                                            <td className="px-4 py-4">
                                                <p className="text-foreground font-semibold">
                                                    {item.name}
                                                </p>
                                                <p className="text-muted-foreground mt-1 font-mono text-[10px]">
                                                    {item.integration_code}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4">
                                                {item.provider}
                                            </td>
                                            <td className="px-4 py-4 capitalize">
                                                {item.environment}
                                            </td>
                                            <td className="px-4 py-4">
                                                {item.scopes.length}
                                            </td>
                                            <td className="px-4 py-4 font-mono">
                                                ••••{item.secret_last_four ?? '----'}
                                            </td>
                                            <td className="px-4 py-4">
                                                <ModuleStatus value={item.status} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="border-border/70 flex items-center justify-between border-t px-4 py-3">
                        <p className="text-muted-foreground text-xs">
                            Page {integrations.current_page} of{' '}
                            {integrations.last_page}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!integrations.prev_page_url}
                                onClick={() =>
                                    integrations.prev_page_url &&
                                    router.visit(
                                        integrations.prev_page_url,
                                    )
                                }
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!integrations.next_page_url}
                                onClick={() =>
                                    integrations.next_page_url &&
                                    router.visit(
                                        integrations.next_page_url,
                                    )
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
                title="New integration"
                description="Create a credential and connection profile for an external service."
                footer={
                    <Button
                        type="button"
                        className="w-full rounded-xl"
                        disabled={createForm.processing}
                        onClick={() =>
                            createForm.post('/admin/integrations-api', {
                                onSuccess: () => {
                                    createForm.reset();
                                    setCreateOpen(false);
                                },
                            })
                        }
                    >
                        Create integration
                    </Button>
                }
            >
                <IntegrationForm
                    data={createForm.data}
                    errors={createForm.errors}
                    setData={createForm.setData}
                    toggleScope={(scope) =>
                        toggleScope(
                            scope,
                            createForm.data.scopes,
                            (scopes) =>
                                createForm.setData('scopes', scopes),
                        )
                    }
                    includeCode
                />
            </ModuleDrawer>

            <ModuleDrawer
                open={selected !== null}
                onClose={() => {
                    setSelected(null);
                    setRevealedSecret('');
                }}
                title={selected?.name ?? 'Integration'}
                description={selected?.integration_code}
                footer={
                    selected && (
                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                className="flex-1 rounded-xl"
                                disabled={editForm.processing}
                                onClick={() =>
                                    editForm.put(
                                        `/admin/integrations-api/${selected.id}`,
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
                                variant="outline"
                                onClick={() =>
                                    router.post(
                                        `/admin/integrations-api/${selected.id}/rotate`,
                                        {},
                                        {
                                            preserveScroll: true,
                                            onSuccess: () =>
                                                setRevealedSecret(''),
                                        },
                                    )
                                }
                            >
                                <RefreshCw className="size-4" />
                                Rotate
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                aria-label="Delete integration"
                                onClick={() => {
                                    if (
                                        confirm(
                                            'Delete this integration?',
                                        )
                                    ) {
                                        router.delete(
                                            `/admin/integrations-api/${selected.id}`,
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
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-muted-foreground text-[10px] font-semibold tracking-widest uppercase">
                                        Client secret
                                    </p>
                                    <p className="text-foreground mt-2 break-all font-mono text-xs">
                                        {revealedSecret ||
                                            `••••••••••••••••${selected.secret_last_four ?? ''}`}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => void revealSecret()}
                                        disabled={revealing}
                                        aria-label="Reveal secret"
                                    >
                                        <Eye className="size-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        disabled={!revealedSecret}
                                        onClick={() =>
                                            void navigator.clipboard.writeText(
                                                revealedSecret,
                                            )
                                        }
                                        aria-label="Copy secret"
                                    >
                                        <Copy className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <IntegrationForm
                            data={editForm.data}
                            errors={editForm.errors}
                            setData={editForm.setData}
                            toggleScope={(scope) =>
                                toggleScope(
                                    scope,
                                    editForm.data.scopes,
                                    (scopes) =>
                                        editForm.setData(
                                            'scopes',
                                            scopes,
                                        ),
                                )
                            }
                        />

                        <div className="border-border/70 bg-muted/20 rounded-xl border p-3">
                            <p className="text-muted-foreground text-[10px] font-semibold uppercase">
                                Current scopes
                            </p>
                            <p className="text-foreground mt-2 text-xs leading-5">
                                {selectedScopeText}
                            </p>
                        </div>
                    </div>
                )}
            </ModuleDrawer>
        </AppLayout>
    );
}

type IntegrationFormData = {
    name: string;
    integration_code?: string;
    provider: string;
    base_url: string;
    webhook_url: string;
    environment: string;
    status: string;
    scopes: string[];
};

function IntegrationForm({
    data,
    errors,
    setData,
    toggleScope,
    includeCode = false,
}: {
    data: IntegrationFormData;
    errors: Record<string, string>;
    setData: (key: keyof IntegrationFormData, value: never) => void;
    toggleScope: (scope: string) => void;
    includeCode?: boolean;
}) {
    return (
        <div className="space-y-4">
            <div>
                <FieldLabel>Name</FieldLabel>
                <input
                    value={data.name}
                    onChange={(event) =>
                        setData('name', event.target.value as never)
                    }
                    className={inputClassName}
                    placeholder="Example: PayMongo Production"
                />
                {errors.name && (
                    <p className="text-destructive mt-1 text-xs">
                        {errors.name}
                    </p>
                )}
            </div>

            {includeCode && (
                <div>
                    <FieldLabel>Integration code</FieldLabel>
                    <input
                        value={data.integration_code ?? ''}
                        onChange={(event) =>
                            setData(
                                'integration_code',
                                event.target.value as never,
                            )
                        }
                        className={inputClassName}
                        placeholder="paymongo-production"
                    />
                    {errors.integration_code && (
                        <p className="text-destructive mt-1 text-xs">
                            {errors.integration_code}
                        </p>
                    )}
                </div>
            )}

            <div>
                <FieldLabel>Provider</FieldLabel>
                <input
                    value={data.provider}
                    onChange={(event) =>
                        setData('provider', event.target.value as never)
                    }
                    className={inputClassName}
                    placeholder="PayMongo, Google, Slack..."
                />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <FieldLabel>Environment</FieldLabel>
                    <select
                        value={data.environment}
                        onChange={(event) =>
                            setData(
                                'environment',
                                event.target.value as never,
                            )
                        }
                        className={selectClassName}
                    >
                        <option value="local">Local</option>
                        <option value="sandbox">Sandbox</option>
                        <option value="production">Production</option>
                    </select>
                </div>

                <div>
                    <FieldLabel>Status</FieldLabel>
                    <select
                        value={data.status}
                        onChange={(event) =>
                            setData('status', event.target.value as never)
                        }
                        className={selectClassName}
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="error">Error</option>
                    </select>
                </div>
            </div>

            <div>
                <FieldLabel>Base URL</FieldLabel>
                <input
                    value={data.base_url}
                    onChange={(event) =>
                        setData('base_url', event.target.value as never)
                    }
                    className={inputClassName}
                    placeholder="https://api.example.com"
                />
            </div>

            <div>
                <FieldLabel>Webhook URL</FieldLabel>
                <input
                    value={data.webhook_url}
                    onChange={(event) =>
                        setData(
                            'webhook_url',
                            event.target.value as never,
                        )
                    }
                    className={inputClassName}
                    placeholder="https://example.com/webhooks/jcm"
                />
            </div>

            <div>
                <FieldLabel>Scopes</FieldLabel>
                <div className="grid gap-2 sm:grid-cols-2">
                    {scopeOptions.map((scope) => (
                        <label
                            key={scope}
                            className="border-border/70 bg-card flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-xs"
                        >
                            <input
                                type="checkbox"
                                checked={data.scopes.includes(scope)}
                                onChange={() => toggleScope(scope)}
                                className="accent-primary"
                            />
                            <span className="font-mono">{scope}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="hidden">
                <textarea className={textareaClassName} />
            </div>
        </div>
    );
}
