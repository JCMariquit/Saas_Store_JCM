import InputError from '@/components/input-error';
import { SectionCard } from '@/components/admin-ui/section-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import {
    Building2,
    Check,
    ChevronLeft,
    ChevronRight,
    CircleDollarSign,
    Clock3,
    Database,
    FileText,
    Mail,
    MapPin,
    PackageCheck,
    Phone,
    RefreshCw,
    ShieldCheck,
    Store,
    UserPlus,
    UserRound,
    Warehouse,
    X,
} from 'lucide-react';
import {
    useEffect,
    useMemo,
    useState,
    type FormEvent,
    type ReactNode,
} from 'react';

type Product = {
    id: number;
    product_code: string;
    name: string;
    status: string;
};

type Plan = {
    id: number;
    product_id: number;
    plan_name: string;
    billing_interval: string;
    price: number;
};

type User = {
    id: number;
    name: string;
    email: string;
};

type Log = {
    id: number;
    owner_name?: string;
    owner_email?: string;
    product_name?: string;
    plan_name?: string;
    status: string;
    business_name: string;
    created_at: string;
};

type Props = {
    products: Product[];
    plans: Plan[];
    users: User[];
    logs: Log[];
};

type ProvisionFormData = {
    existing_user_id: string;
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    product_id: string;
    plan_id: string;
    billing_interval: string;
    subscription_status: string;
    business_name: string;
    business_category: string;
    contact_email: string;
    contact_phone: string;
    address_line: string;
    branch_name: string;
    warehouse_name: string;
    notes: string;
};

type WorkspaceTab = 'account' | 'subscription' | 'business' | 'environment';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Systems Management',
        href: '/admin/systems',
    },
    {
        title: 'Provision Account',
        href: '/admin/systems/provision',
    },
];

const selectClassName =
    'h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary/60 focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60';

const currency = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
});

const workspaceTabs: {
    id: WorkspaceTab;
    label: string;
    description: string;
    icon: ReactNode;
}[] = [
    {
        id: 'account',
        label: 'Account Owner',
        description: 'Subscriber identity',
        icon: <UserRound className="size-4" />,
    },
    {
        id: 'subscription',
        label: 'System & Plan',
        description: 'Access package',
        icon: <PackageCheck className="size-4" />,
    },
    {
        id: 'business',
        label: 'Business',
        description: 'Profile details',
        icon: <Building2 className="size-4" />,
    },
    {
        id: 'environment',
        label: 'Environment',
        description: 'Initial setup',
        icon: <Database className="size-4" />,
    },
];

export default function ProvisionAccount({
    products,
    plans,
    users,
    logs,
}: Props) {
    const [activeTab, setActiveTab] =
        useState<WorkspaceTab>('account');
    const [selectedLog, setSelectedLog] = useState<Log | null>(null);

    const form = useForm<ProvisionFormData>({
        existing_user_id: '',
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        product_id: String(products[0]?.id ?? ''),
        plan_id: '',
        billing_interval: 'monthly',
        subscription_status: 'active',
        business_name: '',
        business_category: '',
        contact_email: '',
        contact_phone: '',
        address_line: '',
        branch_name: 'Main Branch',
        warehouse_name: 'Main Warehouse',
        notes: '',
    });

    const filteredPlans = useMemo(
        () =>
            plans.filter(
                (plan) =>
                    String(plan.product_id) === form.data.product_id,
            ),
        [plans, form.data.product_id],
    );

    const selectedProduct = useMemo(
        () =>
            products.find(
                (product) =>
                    String(product.id) === form.data.product_id,
            ),
        [products, form.data.product_id],
    );

    const selectedPlan = useMemo(
        () =>
            plans.find(
                (plan) => String(plan.id) === form.data.plan_id,
            ),
        [plans, form.data.plan_id],
    );

    const selectedUser = useMemo(
        () =>
            users.find(
                (user) =>
                    String(user.id) === form.data.existing_user_id,
            ),
        [users, form.data.existing_user_id],
    );

    const accountComplete = Boolean(
        selectedUser ||
            (form.data.name.trim() &&
                form.data.email.trim() &&
                form.data.password &&
                form.data.password_confirmation),
    );

    const subscriptionComplete = Boolean(
        form.data.product_id && form.data.plan_id,
    );

    const businessComplete = Boolean(
        form.data.business_name.trim(),
    );

    const environmentComplete = Boolean(
        form.data.branch_name.trim() &&
            form.data.warehouse_name.trim(),
    );

    const tabCompletion: Record<WorkspaceTab, boolean> = {
        account: accountComplete,
        subscription: subscriptionComplete,
        business: businessComplete,
        environment: environmentComplete,
    };

    const completedSteps = Object.values(tabCompletion).filter(
        Boolean,
    ).length;

    useEffect(() => {
        const errorKeys = Object.keys(form.errors);

        if (
            errorKeys.some((key) =>
                [
                    'existing_user_id',
                    'name',
                    'email',
                    'password',
                    'password_confirmation',
                ].includes(key),
            )
        ) {
            setActiveTab('account');
            return;
        }

        if (
            errorKeys.some((key) =>
                [
                    'product_id',
                    'plan_id',
                    'billing_interval',
                    'subscription_status',
                ].includes(key),
            )
        ) {
            setActiveTab('subscription');
            return;
        }

        if (
            errorKeys.some((key) =>
                [
                    'business_name',
                    'business_category',
                    'contact_email',
                    'contact_phone',
                    'address_line',
                ].includes(key),
            )
        ) {
            setActiveTab('business');
            return;
        }

        if (
            errorKeys.some((key) =>
                ['branch_name', 'warehouse_name', 'notes'].includes(
                    key,
                ),
            )
        ) {
            setActiveTab('environment');
        }
    }, [form.errors]);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.post('/admin/systems/provision', {
            preserveScroll: true,
        });
    };

    const handleExistingUserChange = (userId: string) => {
        form.setData('existing_user_id', userId);

        if (userId) {
            form.clearErrors(
                'name',
                'email',
                'password',
                'password_confirmation',
            );
        }
    };

    const handleProductChange = (productId: string) => {
        form.setData('product_id', productId);
        form.setData('plan_id', '');
        form.clearErrors('plan_id');
    };

    const currentTabIndex = workspaceTabs.findIndex(
        (tab) => tab.id === activeTab,
    );

    const moveToPreviousTab = () => {
        const previous = workspaceTabs[currentTabIndex - 1];

        if (previous) {
            setActiveTab(previous.id);
        }
    };

    const moveToNextTab = () => {
        const next = workspaceTabs[currentTabIndex + 1];

        if (next) {
            setActiveTab(next.id);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Provision Account" />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Provision Account
                        </h1>

                        <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
                            Create or connect a subscriber, assign a JCM
                            system and plan, then prepare its initial
                            operating environment.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>
                            {completedSteps} of {workspaceTabs.length}{' '}
                            sections complete
                        </span>

                        <div className="flex gap-1">
                            {workspaceTabs.map((tab) => (
                                <span
                                    key={tab.id}
                                    className={[
                                        'h-1.5 w-7 rounded-full transition',
                                        tabCompletion[tab.id]
                                            ? 'bg-primary'
                                            : 'bg-muted',
                                    ].join(' ')}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <form onSubmit={submit}>
                    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                        <SectionCard
                            title="Provisioning workspace"
                            description="Complete each section before creating the subscriber environment."
                        >
                            <div>
                                <div className="overflow-x-auto border-b border-border">
                                    <div className="flex min-w-max items-end gap-7">
                                        {workspaceTabs.map((tab, index) => (
                                            <button
                                                key={tab.id}
                                                type="button"
                                                className={[
                                                    '-mb-px inline-flex items-center gap-2 border-b-2 px-1 pb-3 pt-1 text-xs font-semibold transition',
                                                    activeTab === tab.id
                                                        ? 'border-primary text-primary'
                                                        : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
                                                ].join(' ')}
                                                onClick={() =>
                                                    setActiveTab(tab.id)
                                                }
                                            >
                                                <span
                                                    className={[
                                                        'flex size-7 items-center justify-center rounded-lg',
                                                        activeTab ===
                                                        tab.id
                                                            ? 'bg-primary/10 text-primary'
                                                            : 'bg-muted text-muted-foreground',
                                                    ].join(' ')}
                                                >
                                                    {tabCompletion[
                                                        tab.id
                                                    ] ? (
                                                        <Check className="size-3.5" />
                                                    ) : (
                                                        tab.icon
                                                    )}
                                                </span>

                                                <span className="text-left">
                                                    <span className="block">
                                                        {index + 1}.{' '}
                                                        {tab.label}
                                                    </span>

                                                    <span className="mt-0.5 block text-[9px] font-normal text-muted-foreground">
                                                        {tab.description}
                                                    </span>
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="py-6">
                                    {activeTab === 'account' && (
                                        <AccountSection
                                            users={users}
                                            selectedUser={selectedUser}
                                            form={form}
                                            onExistingUserChange={
                                                handleExistingUserChange
                                            }
                                        />
                                    )}

                                    {activeTab === 'subscription' && (
                                        <SubscriptionSection
                                            products={products}
                                            plans={filteredPlans}
                                            selectedProduct={
                                                selectedProduct
                                            }
                                            selectedPlan={selectedPlan}
                                            form={form}
                                            onProductChange={
                                                handleProductChange
                                            }
                                        />
                                    )}

                                    {activeTab === 'business' && (
                                        <BusinessSection form={form} />
                                    )}

                                    {activeTab === 'environment' && (
                                        <EnvironmentSection
                                            form={form}
                                            isInventory={
                                                selectedProduct?.product_code ===
                                                'JCM-INVENTORY-001'
                                            }
                                        />
                                    )}
                                </div>

                                <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="rounded-xl"
                                        onClick={moveToPreviousTab}
                                        disabled={currentTabIndex === 0}
                                    >
                                        <ChevronLeft className="size-4" />
                                        Previous
                                    </Button>

                                    {currentTabIndex <
                                    workspaceTabs.length - 1 ? (
                                        <Button
                                            type="button"
                                            className="rounded-xl"
                                            onClick={moveToNextTab}
                                        >
                                            Next section
                                            <ChevronRight className="size-4" />
                                        </Button>
                                    ) : (
                                        <p className="text-[11px] text-muted-foreground">
                                            Review the summary before
                                            provisioning.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </SectionCard>

                        <aside className="xl:sticky xl:top-20">
                            <SectionCard
                                title="Provisioning summary"
                                description="Review the final account configuration."
                            >
                                <div className="space-y-5">
                                    <div className="divide-y divide-border/60 border-y border-border/60">
                                        <SummaryRow
                                            label="Account owner"
                                            value={
                                                selectedUser?.name ||
                                                form.data.name ||
                                                'Not provided'
                                            }
                                        />

                                        <SummaryRow
                                            label="Business"
                                            value={
                                                form.data.business_name ||
                                                'Not provided'
                                            }
                                        />

                                        <SummaryRow
                                            label="System"
                                            value={
                                                selectedProduct?.name ||
                                                'Not selected'
                                            }
                                        />

                                        <SummaryRow
                                            label="Plan"
                                            value={
                                                selectedPlan?.plan_name ||
                                                'Not selected'
                                            }
                                        />

                                        <SummaryRow
                                            label="Billing"
                                            value={formatLabel(
                                                form.data
                                                    .billing_interval,
                                            )}
                                        />

                                        <SummaryRow
                                            label="Starting status"
                                            value={formatLabel(
                                                form.data
                                                    .subscription_status,
                                            )}
                                        />

                                        <SummaryRow
                                            label="Amount"
                                            value={
                                                selectedPlan
                                                    ? currency.format(
                                                          Number(
                                                              selectedPlan.price,
                                                          ),
                                                      )
                                                    : '₱0'
                                            }
                                            emphasized
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <SummaryCheck
                                            complete={accountComplete}
                                            label="Account identity"
                                        />

                                        <SummaryCheck
                                            complete={
                                                subscriptionComplete
                                            }
                                            label="System and plan"
                                        />

                                        <SummaryCheck
                                            complete={businessComplete}
                                            label="Business profile"
                                        />

                                        <SummaryCheck
                                            complete={
                                                environmentComplete
                                            }
                                            label="Operating environment"
                                        />
                                    </div>

                                    {selectedProduct?.product_code ===
                                        'JCM-INVENTORY-001' && (
                                        <div className="border-l-2 border-amber-500 pl-3 text-xs leading-5 text-muted-foreground">
                                            A main branch and warehouse
                                            will also be created in{' '}
                                            <b className="text-foreground">
                                                jcm_inventory_db
                                            </b>
                                            .
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        className="h-11 w-full rounded-xl"
                                        disabled={
                                            form.processing ||
                                            !accountComplete ||
                                            !subscriptionComplete ||
                                            !businessComplete ||
                                            !environmentComplete
                                        }
                                    >
                                        {form.processing ? (
                                            <>
                                                <RefreshCw className="size-4 animate-spin" />
                                                Provisioning...
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus className="size-4" />
                                                Provision account
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </SectionCard>
                        </aside>
                    </div>
                </form>

                <SectionCard
                    title="Recent provisioning"
                    description="Latest subscriber environments created through the central provisioner."
                    actions={
                        <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
                            {logs.length.toLocaleString()} record
                            {logs.length === 1 ? '' : 's'}
                        </span>
                    }
                >
                    <ProvisioningTable
                        logs={logs}
                        onSelect={setSelectedLog}
                    />
                </SectionCard>
            </div>

            {selectedLog && (
                <ProvisioningDetailsDrawer
                    log={selectedLog}
                    onClose={() => setSelectedLog(null)}
                />
            )}
        </AppLayout>
    );
}

function AccountSection({
    users,
    selectedUser,
    form,
    onExistingUserChange,
}: {
    users: User[];
    selectedUser?: User;
    form: ReturnType<typeof useForm<ProvisionFormData>>;
    onExistingUserChange: (userId: string) => void;
}) {
    return (
        <div className="space-y-6">
            <SectionHeading
                title="Account owner"
                description="Select an existing subscriber or register a new account owner."
            />

            <Field
                label="Existing subscriber"
                hint="Leave this on Create new account when registering a new subscriber."
            >
                <select
                    className={selectClassName}
                    value={form.data.existing_user_id}
                    onChange={(event) =>
                        onExistingUserChange(event.target.value)
                    }
                >
                    <option value="">Create a new account</option>

                    {users.map((user) => (
                        <option key={user.id} value={user.id}>
                            {user.name} — {user.email}
                        </option>
                    ))}
                </select>

                <InputError
                    message={form.errors.existing_user_id}
                />
            </Field>

            {selectedUser ? (
                <div className="flex items-center gap-3 border-y border-border/60 py-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <UserRound className="size-4" />
                    </span>

                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                            {selectedUser.name}
                        </p>

                        <p className="mt-1 truncate text-xs text-muted-foreground">
                            {selectedUser.email}
                        </p>
                    </div>

                    <span className="ml-auto rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-bold uppercase text-emerald-700 dark:text-emerald-400">
                        Existing account
                    </span>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Full name" required>
                        <Input
                            value={form.data.name}
                            onChange={(event) =>
                                form.setData(
                                    'name',
                                    event.target.value,
                                )
                            }
                            placeholder="Account owner's full name"
                            autoComplete="name"
                        />

                        <InputError message={form.errors.name} />
                    </Field>

                    <Field label="Email address" required>
                        <Input
                            type="email"
                            value={form.data.email}
                            onChange={(event) =>
                                form.setData(
                                    'email',
                                    event.target.value,
                                )
                            }
                            placeholder="owner@example.com"
                            autoComplete="email"
                        />

                        <InputError message={form.errors.email} />
                    </Field>

                    <Field label="Temporary password" required>
                        <Input
                            type="password"
                            value={form.data.password}
                            onChange={(event) =>
                                form.setData(
                                    'password',
                                    event.target.value,
                                )
                            }
                            placeholder="Temporary password"
                            autoComplete="new-password"
                        />

                        <InputError message={form.errors.password} />
                    </Field>

                    <Field label="Confirm password" required>
                        <Input
                            type="password"
                            value={form.data.password_confirmation}
                            onChange={(event) =>
                                form.setData(
                                    'password_confirmation',
                                    event.target.value,
                                )
                            }
                            placeholder="Repeat password"
                            autoComplete="new-password"
                        />

                        <InputError
                            message={
                                form.errors.password_confirmation
                            }
                        />
                    </Field>
                </div>
            )}
        </div>
    );
}

function SubscriptionSection({
    products,
    plans,
    selectedProduct,
    selectedPlan,
    form,
    onProductChange,
}: {
    products: Product[];
    plans: Plan[];
    selectedProduct?: Product;
    selectedPlan?: Plan;
    form: ReturnType<typeof useForm<ProvisionFormData>>;
    onProductChange: (productId: string) => void;
}) {
    return (
        <div className="space-y-6">
            <SectionHeading
                title="System and subscription"
                description="Choose the JCM product, subscription plan, billing cycle, and initial status."
            />

            <div className="grid gap-4 md:grid-cols-2">
                <Field label="JCM system" required>
                    <select
                        className={selectClassName}
                        value={form.data.product_id}
                        onChange={(event) =>
                            onProductChange(event.target.value)
                        }
                    >
                        {products.map((product) => (
                            <option
                                key={product.id}
                                value={product.id}
                            >
                                {product.name} —{' '}
                                {formatLabel(product.status)}
                            </option>
                        ))}
                    </select>

                    <InputError
                        message={form.errors.product_id}
                    />
                </Field>

                <Field label="Subscription plan" required>
                    <select
                        className={selectClassName}
                        value={form.data.plan_id}
                        onChange={(event) =>
                            form.setData(
                                'plan_id',
                                event.target.value,
                            )
                        }
                        disabled={!form.data.product_id}
                    >
                        <option value="">Select a plan</option>

                        {plans.map((plan) => (
                            <option key={plan.id} value={plan.id}>
                                {plan.plan_name} —{' '}
                                {currency.format(Number(plan.price))}
                            </option>
                        ))}
                    </select>

                    <InputError message={form.errors.plan_id} />
                </Field>

                <Field label="Billing cycle" required>
                    <select
                        className={selectClassName}
                        value={form.data.billing_interval}
                        onChange={(event) =>
                            form.setData(
                                'billing_interval',
                                event.target.value,
                            )
                        }
                    >
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="yearly">Yearly</option>
                        <option value="custom">
                            Custom / plan default
                        </option>
                    </select>

                    <InputError
                        message={form.errors.billing_interval}
                    />
                </Field>

                <Field label="Starting status" required>
                    <select
                        className={selectClassName}
                        value={form.data.subscription_status}
                        onChange={(event) =>
                            form.setData(
                                'subscription_status',
                                event.target.value,
                            )
                        }
                    >
                        <option value="active">Active</option>
                        <option value="trial">Trial</option>
                        <option value="pending">Pending</option>
                    </select>

                    <InputError
                        message={
                            form.errors.subscription_status
                        }
                    />
                </Field>
            </div>

            <div className="grid border-y border-border/60 sm:grid-cols-3 sm:divide-x sm:divide-border/60">
                <PackagePreview
                    icon={<PackageCheck className="size-4" />}
                    label="Selected system"
                    value={selectedProduct?.name ?? 'Not selected'}
                />

                <PackagePreview
                    icon={<ShieldCheck className="size-4" />}
                    label="Selected plan"
                    value={selectedPlan?.plan_name ?? 'Not selected'}
                />

                <PackagePreview
                    icon={<CircleDollarSign className="size-4" />}
                    label="Plan amount"
                    value={
                        selectedPlan
                            ? currency.format(
                                  Number(selectedPlan.price),
                              )
                            : '₱0'
                    }
                />
            </div>
        </div>
    );
}

function BusinessSection({
    form,
}: {
    form: ReturnType<typeof useForm<ProvisionFormData>>;
}) {
    return (
        <div className="space-y-6">
            <SectionHeading
                title="Business profile"
                description="Enter the subscriber's business identity and primary contact details."
            />

            <div className="grid gap-4 md:grid-cols-2">
                <Field label="Business name" required>
                    <Input
                        value={form.data.business_name}
                        onChange={(event) =>
                            form.setData(
                                'business_name',
                                event.target.value,
                            )
                        }
                        placeholder="Registered or display business name"
                    />

                    <InputError
                        message={form.errors.business_name}
                    />
                </Field>

                <Field label="Business category">
                    <Input
                        value={form.data.business_category}
                        onChange={(event) =>
                            form.setData(
                                'business_category',
                                event.target.value,
                            )
                        }
                        placeholder="Retail, wholesale, services..."
                    />

                    <InputError
                        message={form.errors.business_category}
                    />
                </Field>

                <Field
                    label="Contact email"
                    icon={<Mail className="size-3.5" />}
                >
                    <Input
                        type="email"
                        value={form.data.contact_email}
                        onChange={(event) =>
                            form.setData(
                                'contact_email',
                                event.target.value,
                            )
                        }
                        placeholder="business@example.com"
                    />

                    <InputError
                        message={form.errors.contact_email}
                    />
                </Field>

                <Field
                    label="Contact phone"
                    icon={<Phone className="size-3.5" />}
                >
                    <Input
                        value={form.data.contact_phone}
                        onChange={(event) =>
                            form.setData(
                                'contact_phone',
                                event.target.value,
                            )
                        }
                        placeholder="09XX XXX XXXX"
                    />

                    <InputError
                        message={form.errors.contact_phone}
                    />
                </Field>

                <div className="md:col-span-2">
                    <Field
                        label="Business address"
                        icon={<MapPin className="size-3.5" />}
                    >
                        <Input
                            value={form.data.address_line}
                            onChange={(event) =>
                                form.setData(
                                    'address_line',
                                    event.target.value,
                                )
                            }
                            placeholder="Street, barangay, municipality, province"
                        />

                        <InputError
                            message={form.errors.address_line}
                        />
                    </Field>
                </div>
            </div>
        </div>
    );
}

function EnvironmentSection({
    form,
    isInventory,
}: {
    form: ReturnType<typeof useForm<ProvisionFormData>>;
    isInventory: boolean;
}) {
    return (
        <div className="space-y-6">
            <SectionHeading
                title="Operational environment"
                description="Prepare the default branch, location, and internal provisioning notes."
            />

            <div className="grid gap-4 md:grid-cols-2">
                <Field
                    label="Default branch"
                    required
                    icon={<Store className="size-3.5" />}
                >
                    <Input
                        value={form.data.branch_name}
                        onChange={(event) =>
                            form.setData(
                                'branch_name',
                                event.target.value,
                            )
                        }
                        placeholder="Main Branch"
                    />

                    <InputError
                        message={form.errors.branch_name}
                    />
                </Field>

                <Field
                    label="Default warehouse or location"
                    required
                    icon={<Warehouse className="size-3.5" />}
                >
                    <Input
                        value={form.data.warehouse_name}
                        onChange={(event) =>
                            form.setData(
                                'warehouse_name',
                                event.target.value,
                            )
                        }
                        placeholder="Main Warehouse"
                    />

                    <InputError
                        message={form.errors.warehouse_name}
                    />
                </Field>

                <div className="md:col-span-2">
                    <Field
                        label="Internal provisioning notes"
                        icon={<FileText className="size-3.5" />}
                        hint="Visible only to platform administrators."
                    >
                        <textarea
                            className="min-h-32 w-full resize-y rounded-xl border border-input bg-background px-3 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
                            value={form.data.notes}
                            onChange={(event) =>
                                form.setData(
                                    'notes',
                                    event.target.value,
                                )
                            }
                            placeholder="Add onboarding instructions, payment notes, or special setup requirements..."
                        />

                        <InputError message={form.errors.notes} />
                    </Field>
                </div>
            </div>

            {isInventory && (
                <div className="border-l-2 border-primary pl-3">
                    <p className="text-xs font-semibold text-foreground">
                        Inventory operational setup
                    </p>

                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        The selected branch and warehouse will be
                        created in the connected Inventory database.
                    </p>
                </div>
            )}
        </div>
    );
}

function ProvisioningTable({
    logs,
    onSelect,
}: {
    logs: Log[];
    onSelect: (log: Log) => void;
}) {
    if (logs.length === 0) {
        return (
            <div className="border-y border-dashed border-border py-12 text-center">
                <Database className="mx-auto size-5 text-muted-foreground" />

                <p className="mt-3 text-sm font-semibold text-foreground">
                    No provisioning history yet
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                    Newly created account environments will appear
                    here.
                </p>
            </div>
        );
    }

    return (
        <div>
            <div className="hidden grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_110px_130px_24px] gap-4 border-b border-border/70 px-1 py-2.5 lg:grid">
                <TableHeading>Business</TableHeading>
                <TableHeading>Owner</TableHeading>
                <TableHeading>System & plan</TableHeading>
                <TableHeading>Status</TableHeading>
                <TableHeading>Created</TableHeading>
                <span />
            </div>

            <div className="divide-y divide-border/60">
                {logs.map((log) => (
                    <button
                        key={log.id}
                        type="button"
                        className="grid w-full grid-cols-[minmax(0,1fr)_24px] items-center gap-4 px-1 py-3.5 text-left transition hover:bg-muted/20 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_110px_130px_24px]"
                        onClick={() => onSelect(log)}
                    >
                        <div className="flex min-w-0 items-center gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Building2 className="size-4" />
                            </span>

                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-foreground">
                                    {log.business_name}
                                </p>

                                <p className="mt-0.5 text-[10px] text-muted-foreground lg:hidden">
                                    {log.product_name || 'No system'} ·{' '}
                                    {log.plan_name || 'No plan'}
                                </p>
                            </div>
                        </div>

                        <div className="hidden min-w-0 lg:block">
                            <p className="truncate text-xs font-medium text-foreground">
                                {log.owner_name || 'Unknown owner'}
                            </p>

                            <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                                {log.owner_email || 'No email'}
                            </p>
                        </div>

                        <div className="hidden min-w-0 lg:block">
                            <p className="truncate text-xs font-medium text-foreground">
                                {log.product_name || 'No system'}
                            </p>

                            <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                                {log.plan_name || 'No plan'}
                            </p>
                        </div>

                        <div className="hidden lg:block">
                            <StatusBadge status={log.status} />
                        </div>

                        <p className="hidden text-[10px] text-muted-foreground lg:block">
                            {formatDateTime(log.created_at)}
                        </p>

                        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                    </button>
                ))}
            </div>
        </div>
    );
}

function ProvisioningDetailsDrawer({
    log,
    onClose,
}: {
    log: Log;
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
            document.removeEventListener(
                'keydown',
                handleEscape,
            );
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

            <aside className="absolute top-0 right-0 flex h-full w-full max-w-lg flex-col border-l border-border bg-background shadow-2xl">
                <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
                    <div className="min-w-0">
                        <h2 className="truncate text-lg font-semibold text-foreground">
                            {log.business_name}
                        </h2>

                        <p className="mt-1 text-xs text-muted-foreground">
                            Provisioning record #{log.id}
                        </p>
                    </div>

                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="shrink-0 rounded-xl"
                        onClick={onClose}
                    >
                        <X className="size-4" />
                    </Button>
                </div>

                <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-6">
                    <div>
                        <StatusBadge status={log.status} />
                    </div>

                    <DetailSection title="Subscriber">
                        <DetailRow
                            label="Account owner"
                            value={log.owner_name || 'Unknown owner'}
                        />

                        <DetailRow
                            label="Email"
                            value={log.owner_email || 'No email'}
                        />

                        <DetailRow
                            label="Business"
                            value={log.business_name}
                        />
                    </DetailSection>

                    <DetailSection title="Provisioned system">
                        <DetailRow
                            label="JCM system"
                            value={log.product_name || 'No system'}
                        />

                        <DetailRow
                            label="Subscription plan"
                            value={log.plan_name || 'No plan'}
                        />
                    </DetailSection>

                    <DetailSection title="Timeline">
                        <DetailRow
                            label="Created"
                            value={formatDateTime(log.created_at)}
                        />
                    </DetailSection>
                </div>
            </aside>
        </div>
    );
}

function SectionHeading({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div>
            <h3 className="text-sm font-semibold text-foreground">
                {title}
            </h3>

            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {description}
            </p>
        </div>
    );
}

function Field({
    label,
    children,
    hint,
    icon,
    required = false,
}: {
    label: string;
    children: ReactNode;
    hint?: string;
    icon?: ReactNode;
    required?: boolean;
}) {
    return (
        <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                {icon && (
                    <span className="text-muted-foreground">
                        {icon}
                    </span>
                )}

                <span>{label}</span>

                {required && (
                    <span className="text-destructive">*</span>
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

function PackagePreview({
    icon,
    label,
    value,
}: {
    icon: ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="flex min-w-0 items-start gap-3 px-4 py-4 first:pl-0 last:pr-0">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {icon}
            </span>

            <div className="min-w-0">
                <p className="text-[9px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                    {label}
                </p>

                <p className="mt-1 truncate text-sm font-semibold text-foreground">
                    {value}
                </p>
            </div>
        </div>
    );
}

function SummaryRow({
    label,
    value,
    emphasized = false,
}: {
    label: string;
    value: string;
    emphasized?: boolean;
}) {
    return (
        <div className="flex items-center justify-between gap-4 py-3">
            <span className="text-xs text-muted-foreground">
                {label}
            </span>

            <span
                className={[
                    'max-w-[190px] truncate text-right text-xs font-semibold',
                    emphasized
                        ? 'text-sm font-bold text-primary'
                        : 'text-foreground',
                ].join(' ')}
                title={value}
            >
                {value}
            </span>
        </div>
    );
}

function SummaryCheck({
    complete,
    label,
}: {
    complete: boolean;
    label: string;
}) {
    return (
        <div className="flex items-center gap-3">
            <span
                className={[
                    'flex size-6 items-center justify-center rounded-full',
                    complete
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-muted text-muted-foreground',
                ].join(' ')}
            >
                {complete ? (
                    <Check className="size-3.5" />
                ) : (
                    <Clock3 className="size-3.5" />
                )}
            </span>

            <span
                className={[
                    'text-xs',
                    complete
                        ? 'font-medium text-foreground'
                        : 'text-muted-foreground',
                ].join(' ')}
            >
                {label}
            </span>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const normalized = status.toLowerCase();

    const className =
        normalized === 'completed' ||
        normalized === 'success' ||
        normalized === 'active'
            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
            : normalized === 'failed'
              ? 'border-destructive/20 bg-destructive/10 text-destructive'
              : 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400';

    return (
        <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-bold tracking-[0.08em] uppercase ${className}`}
        >
            {formatLabel(status)}
        </span>
    );
}

function TableHeading({ children }: { children: ReactNode }) {
    return (
        <span className="text-[9px] font-semibold tracking-[0.13em] text-muted-foreground uppercase">
            {children}
        </span>
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

function formatDateTime(value?: string | null) {
    if (!value) {
        return 'Date unavailable';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
}