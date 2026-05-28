import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { FormEvent, useMemo, useState } from 'react';
import {
    Building2,
    CheckCircle2,
    Edit,
    ExternalLink,
    MoreHorizontal,
    Plus,
    Power,
    Save,
    Search,
    Store,
    Trash2,
    X,
} from 'lucide-react';

const BRANCHES_URL = '/client/management/branches';
const STORE_PROFILE_URL = '/client/management/store-profile';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Branches',
        href: BRANCHES_URL,
    },
];

type Branch = {
    id: number;
    tenant_id: number;
    name: string;
    code?: string | null;
    is_main: boolean;
    is_active: boolean;
    created_at?: string | null;
    updated_at?: string | null;
};

type BranchForm = {
    name: string;
    code: string;
    is_main: boolean;
    is_active: boolean;
};

type Props = {
    branches: Branch[];
    filters?: {
        search?: string;
    };
};

const emptyForm: BranchForm = {
    name: '',
    code: '',
    is_main: false,
    is_active: true,
};

export default function BranchesIndex({ branches = [], filters }: Props) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

    const form = useForm<BranchForm>(emptyForm);

    const activeCount = useMemo(() => branches.filter((branch) => branch.is_active).length, [branches]);
    const mainBranch = useMemo(() => branches.find((branch) => branch.is_main), [branches]);

    const openCreate = () => {
        setEditingBranch(null);
        form.clearErrors();
        form.setData(emptyForm);
        setModalOpen(true);
    };

    const openEdit = (branch: Branch) => {
        setEditingBranch(branch);
        form.clearErrors();
        form.setData({
            name: branch.name ?? '',
            code: branch.code ?? '',
            is_main: Boolean(branch.is_main),
            is_active: Boolean(branch.is_active),
        });
        setModalOpen(true);
    };

    const closeModal = () => {
        if (form.processing) return;

        setModalOpen(false);
        setEditingBranch(null);
        form.clearErrors();
        form.reset();
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();

        if (form.processing) return;

        if (editingBranch) {
            form.transform((data) => ({
                ...data,
                _method: 'put',
            }));

            form.post(`${BRANCHES_URL}/${editingBranch.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    closeModal();
                },
                onFinish: () => {
                    form.transform((data) => data);
                },
            });

            return;
        }

        form.transform((data) => data);

        form.post(BRANCHES_URL, {
            preserveScroll: true,
            onSuccess: () => {
                closeModal();
            },
        });
    };

    const runSearch = (e: FormEvent) => {
        e.preventDefault();

        router.get(
            BRANCHES_URL,
            { search },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const clearSearch = () => {
        setSearch('');

        router.get(
            BRANCHES_URL,
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const toggleStatus = (branch: Branch) => {
        router.patch(
            `${BRANCHES_URL}/${branch.id}/toggle-status`,
            {},
            {
                preserveScroll: true,
            },
        );
    };

    const deleteBranch = (branch: Branch) => {
        if (branch.is_main) return;

        if (!confirm(`Delete ${branch.name}? This action cannot be undone.`)) return;

        router.delete(`${BRANCHES_URL}/${branch.id}`, {
            preserveScroll: true,
        });
    };

    const openProfile = (branch: Branch) => {
        router.get(
            STORE_PROFILE_URL,
            { branch_id: branch.id },
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Branches" />

            <div className="flex h-full flex-1 flex-col gap-5 p-4 md:p-6">
                <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-background via-background to-muted/40 p-5 shadow-sm md:p-6">
                    <div className="absolute -right-16 -top-16 size-56 rounded-full bg-primary/10 blur-3xl" />
                    <div className="absolute -bottom-20 left-8 size-56 rounded-full bg-blue-500/10 blur-3xl" />

                    <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-lg border border-border/80 bg-background/80 px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm">
                                <Building2 className="size-3.5" />
                                POS Branch Management
                            </div>

                            <h1 className="mt-3 text-2xl font-semibold tracking-tight">Branches</h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Create branch records only. Branch profile details are managed separately in Store Profile.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={openCreate}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
                        >
                            <Plus className="size-4" />
                            Add Branch
                        </button>
                    </div>

                    <div className="relative mt-6 grid gap-4 md:grid-cols-3">
                        <StatCard title="Total Branches" value={branches.length} icon={<Building2 className="size-5" />} />
                        <StatCard title="Active Branches" value={activeCount} icon={<CheckCircle2 className="size-5" />} />
                        <StatCard title="Main Branch" value={mainBranch?.name ?? 'Not set'} icon={<Store className="size-5" />} />
                    </div>
                </div>

                <div className="rounded-2xl border border-border/70 bg-background shadow-sm">
                    <div className="flex flex-col gap-4 border-b border-border/70 p-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-lg font-semibold">Branch Directory</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Search and manage branch names, branch codes, and branch status.
                            </p>
                        </div>

                        <form onSubmit={runSearch} className="flex w-full gap-2 md:w-auto">
                            <div className="relative flex-1 md:w-80 md:flex-none">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search branch name or code..."
                                    className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>

                            <button
                                type="submit"
                                className="h-10 rounded-xl border border-border bg-background px-4 text-sm font-semibold transition hover:bg-muted"
                            >
                                Search
                            </button>

                            {filters?.search && (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="h-10 rounded-xl border border-border bg-background px-3 text-sm font-semibold transition hover:bg-muted"
                                >
                                    Clear
                                </button>
                            )}
                        </form>
                    </div>

                    <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
                        {branches.length > 0 ? (
                            branches.map((branch) => (
                                <BranchCard
                                    key={branch.id}
                                    branch={branch}
                                    onEdit={() => openEdit(branch)}
                                    onToggle={() => toggleStatus(branch)}
                                    onDelete={() => deleteBranch(branch)}
                                    onProfile={() => openProfile(branch)}
                                />
                            ))
                        ) : (
                            <div className="col-span-full flex min-h-60 flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center">
                                <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                                    <Building2 className="size-6" />
                                </div>
                                <h3 className="mt-4 font-semibold">No branches found</h3>
                                <p className="mt-1 text-sm text-muted-foreground">Create your first branch to get started.</p>
                                <button
                                    type="button"
                                    onClick={openCreate}
                                    className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
                                >
                                    <Plus className="size-4" />
                                    Add Branch
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {modalOpen && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
                            <div className="flex items-start justify-between gap-4 border-b border-border p-5">
                                <div>
                                    <h3 className="text-xl font-semibold">{editingBranch ? 'Edit Branch' : 'Create Branch'}</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {editingBranch
                                            ? 'Update branch name, code, and status.'
                                            : 'Create a branch record first, then add profile details later.'}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                >
                                    <X className="size-5" />
                                </button>
                            </div>

                            <form onSubmit={submit} className="p-5">
                                <div className="space-y-5">
                                    <Section title="Branch Information">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <Field label="Branch Name" error={form.errors.name}>
                                                <input
                                                    value={form.data.name}
                                                    onChange={(e) => form.setData('name', e.target.value)}
                                                    className={inputClassName}
                                                    placeholder="e.g. Main Branch"
                                                />
                                            </Field>

                                            <Field label="Branch Code" error={form.errors.code}>
                                                <input
                                                    value={form.data.code}
                                                    onChange={(e) => form.setData('code', e.target.value)}
                                                    className={inputClassName}
                                                    placeholder="e.g. MAIN"
                                                />
                                            </Field>
                                        </div>
                                    </Section>

                                    <Section title="Branch Status">
                                        <div className="space-y-3">
                                            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border p-3">
                                                <div>
                                                    <p className="text-sm font-semibold">Main Branch</p>
                                                    <p className="text-xs text-muted-foreground">Set this branch as the main branch.</p>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={form.data.is_main}
                                                    onChange={(e) => form.setData('is_main', e.target.checked)}
                                                    className="size-4"
                                                />
                                            </label>

                                            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border p-3">
                                                <div>
                                                    <p className="text-sm font-semibold">Active Branch</p>
                                                    <p className="text-xs text-muted-foreground">Allow this branch to operate.</p>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={form.data.is_active}
                                                    onChange={(e) => form.setData('is_active', e.target.checked)}
                                                    className="size-4"
                                                />
                                            </label>
                                        </div>
                                    </Section>
                                </div>

                                <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="h-10 rounded-xl border border-border bg-background px-4 text-sm font-semibold transition hover:bg-muted"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={form.processing}
                                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
                                    >
                                        <Save className="size-4" />
                                        {form.processing ? 'Saving...' : editingBranch ? 'Update Branch' : 'Create Branch'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

function BranchCard({
    branch,
    onEdit,
    onToggle,
    onDelete,
    onProfile,
}: {
    branch: Branch;
    onEdit: () => void;
    onToggle: () => void;
    onDelete: () => void;
    onProfile: () => void;
}) {
    return (
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-background shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="border-b border-border/70 bg-gradient-to-br from-muted/70 via-muted/40 to-background p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex size-12 items-center justify-center rounded-2xl bg-background text-muted-foreground shadow-sm ring-1 ring-border">
                            <Store className="size-6" />
                        </div>

                        <div>
                            <h3 className="font-semibold leading-tight">{branch.name}</h3>
                            <p className="mt-1 text-xs text-muted-foreground">{branch.code || 'No code'}</p>
                        </div>
                    </div>

                    <MoreHorizontal className="size-4 text-muted-foreground" />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                    {branch.is_main && (
                        <span className="rounded-lg bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
                            Main
                        </span>
                    )}

                    <span
                        className={
                            branch.is_active
                                ? 'rounded-lg bg-green-500/90 px-2 py-1 text-xs font-semibold text-white'
                                : 'rounded-lg bg-zinc-500/90 px-2 py-1 text-xs font-semibold text-white'
                        }
                    >
                        {branch.is_active ? 'Active' : 'Inactive'}
                    </span>
                </div>
            </div>

            <div className="p-4">
                <p className="text-sm text-muted-foreground">
                    Add address, logo, receipt settings, TIN, and contact details in this branch profile.
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={onProfile}
                        className="col-span-2 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold transition hover:bg-muted"
                    >
                        <ExternalLink className="size-4" />
                        Open Store Profile
                    </button>

                    <button
                        type="button"
                        onClick={onEdit}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold transition hover:bg-muted"
                    >
                        <Edit className="size-4" />
                        Edit
                    </button>

                    <button
                        type="button"
                        onClick={onToggle}
                        disabled={branch.is_main}
                        title={branch.is_main ? 'Main branch cannot be deactivated' : 'Toggle branch status'}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Power className="size-4" />
                        {branch.is_active ? 'Disable' : 'Enable'}
                    </button>

                    <button
                        type="button"
                        onClick={onDelete}
                        disabled={branch.is_main}
                        className="col-span-2 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50"
                    >
                        <Trash2 className="size-4" />
                        Delete Branch
                    </button>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
    return (
        <div className="rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p className="mt-1 truncate text-xl font-semibold">{value}</p>
                </div>
                <div className="flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    {icon}
                </div>
            </div>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl border border-border/70 bg-background p-4 shadow-sm">
            <h4 className="mb-4 font-semibold">{title}</h4>
            <div className="space-y-4">{children}</div>
        </div>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-foreground">{label}</label>
            {children}
            {error && <p className="text-xs font-medium text-red-600">{error}</p>}
        </div>
    );
}

const inputClassName =
    'h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500';