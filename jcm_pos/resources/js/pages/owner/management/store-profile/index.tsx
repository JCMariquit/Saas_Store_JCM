import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import {
    AlertCircle,
    BadgeCheck,
    Building2,
    Camera,
    CheckCircle2,
    GitBranch,
    Globe2,
    Mail,
    MapPin,
    Phone,
    ReceiptText,
    Save,
    Store,
    Upload,
    X,
} from 'lucide-react';

const STORE_PROFILE_URL = '/client/management/store-profile';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Store Profile',
        href: STORE_PROFILE_URL,
    },
];

type Branch = {
    id: number;
    tenant_id: number;
    name: string;
    code?: string | null;
    is_main: boolean;
    is_active: boolean;

    profile_id?: number | null;
    store_name?: string | null;
    business_type?: string | null;
    description?: string | null;
    email?: string | null;
    phone?: string | null;
    address_line?: string | null;
    barangay?: string | null;
    city?: string | null;
    province?: string | null;
    postal_code?: string | null;
    country?: string | null;
    tin?: string | null;
    permit_no?: string | null;
    currency?: string | null;
    timezone?: string | null;
    receipt_header?: string | null;
    receipt_footer?: string | null;
    logo_path?: string | null;
    cover_path?: string | null;
    logo_url?: string | null;
    cover_url?: string | null;
    updated_at?: string | null;
};

type StoreProfile = {
    id?: number;
    client_id?: number;
    branch_id?: number;
    store_name?: string | null;
    business_type?: string | null;
    description?: string | null;
    email?: string | null;
    phone?: string | null;
    address_line?: string | null;
    barangay?: string | null;
    city?: string | null;
    province?: string | null;
    postal_code?: string | null;
    country?: string | null;
    logo_path?: string | null;
    cover_path?: string | null;
    logo_url?: string | null;
    cover_url?: string | null;
    tin?: string | null;
    permit_no?: string | null;
    currency?: string | null;
    timezone?: string | null;
    receipt_header?: string | null;
    receipt_footer?: string | null;
    is_active?: boolean;
    updated_at?: string | null;
};

type StoreProfileForm = {
    branch_id: string;
    store_name: string;
    business_type: string;
    description: string;
    email: string;
    phone: string;
    address_line: string;
    barangay: string;
    city: string;
    province: string;
    postal_code: string;
    country: string;
    tin: string;
    permit_no: string;
    currency: string;
    timezone: string;
    receipt_header: string;
    receipt_footer: string;
    logo: File | null;
    cover: File | null;
};

type StoreProfilePageProps = {
    profile: StoreProfile;
    branches: Branch[];
    selected_branch: Branch;
    selected_branch_id?: number | null;
    logo_url?: string | null;
    cover_url?: string | null;
};

function storageUrl(url?: string | null): string | null {
    if (!url) return null;

    if (url.startsWith('blob:')) return url;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;

    if (url.startsWith('/storage/')) return url;
    if (url.startsWith('storage/')) return `/${url}`;

    return `/storage/${url.replace(/^\/+/, '')}`;
}

function cacheBust(url?: string | null, version?: string | null): string | null {
    const cleanUrl = storageUrl(url);

    if (!cleanUrl) return null;
    if (cleanUrl.startsWith('blob:')) return cleanUrl;

    return `${cleanUrl}${cleanUrl.includes('?') ? '&' : '?'}v=${encodeURIComponent(version ?? String(Date.now()))}`;
}

function branchToForm(branch: Branch): StoreProfileForm {
    return {
        branch_id: String(branch.id),
        store_name: branch.store_name ?? branch.name ?? '',
        business_type: branch.business_type ?? '',
        description: branch.description ?? '',
        email: branch.email ?? '',
        phone: branch.phone ?? '',
        address_line: branch.address_line ?? '',
        barangay: branch.barangay ?? '',
        city: branch.city ?? '',
        province: branch.province ?? '',
        postal_code: branch.postal_code ?? '',
        country: branch.country ?? 'Philippines',
        tin: branch.tin ?? '',
        permit_no: branch.permit_no ?? '',
        currency: branch.currency ?? 'PHP',
        timezone: branch.timezone ?? 'Asia/Manila',
        receipt_header: branch.receipt_header ?? '',
        receipt_footer: branch.receipt_footer ?? '',
        logo: null,
        cover: null,
    };
}

export default function StoreProfileIndex({
    branches = [],
    selected_branch,
    selected_branch_id,
}: StoreProfilePageProps) {
    const [saveModal, setSaveModal] = useState({
        open: false,
        type: 'success' as 'success' | 'error',
        title: '',
        message: '',
    });

    const [selectedBranchId, setSelectedBranchId] = useState<string>(
        selected_branch_id ? String(selected_branch_id) : selected_branch?.id ? String(selected_branch.id) : '',
    );

    const selectedBranch = useMemo(() => {
        return branches.find((branch) => String(branch.id) === selectedBranchId) ?? selected_branch;
    }, [branches, selectedBranchId, selected_branch]);

    const form = useForm<StoreProfileForm>(branchToForm(selectedBranch));

    const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(
        cacheBust(selectedBranch?.logo_url ?? selectedBranch?.logo_path, selectedBranch?.updated_at),
    );

    const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(
        cacheBust(selectedBranch?.cover_url ?? selectedBranch?.cover_path, selectedBranch?.updated_at),
    );

    useEffect(() => {
        if (!selectedBranch) return;

        form.setData(branchToForm(selectedBranch));

        setLogoPreviewUrl(cacheBust(selectedBranch.logo_url ?? selectedBranch.logo_path, selectedBranch.updated_at));
        setCoverPreviewUrl(cacheBust(selectedBranch.cover_url ?? selectedBranch.cover_path, selectedBranch.updated_at));
    }, [selectedBranchId, selectedBranch]);

    const fullAddress = useMemo(() => {
        return [
            form.data.address_line,
            form.data.barangay,
            form.data.city,
            form.data.province,
            form.data.postal_code,
            form.data.country,
        ]
            .filter(Boolean)
            .join(', ');
    }, [
        form.data.address_line,
        form.data.barangay,
        form.data.city,
        form.data.province,
        form.data.postal_code,
        form.data.country,
    ]);

    const logoPreview = form.data.logo ? URL.createObjectURL(form.data.logo) : logoPreviewUrl;
    const coverPreview = form.data.cover ? URL.createObjectURL(form.data.cover) : coverPreviewUrl;

    const handleBranchChange = (branchId: string) => {
        setSelectedBranchId(branchId);

        router.get(
            STORE_PROFILE_URL,
            { branch_id: branchId },
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();

        form.post(STORE_PROFILE_URL, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.setData('logo', null);
                form.setData('cover', null);

                router.reload({
                    only: ['branches', 'selected_branch', 'selected_branch_id', 'profile', 'logo_url', 'cover_url'],
                    onSuccess: () => {
                        setSaveModal({
                            open: true,
                            type: 'success',
                            title: 'Store Profile Saved',
                            message: 'The selected branch profile has been updated successfully.',
                        });
                    },
                });
            },
            onError: () => {
                setSaveModal({
                    open: true,
                    type: 'error',
                    title: 'Unable to Save',
                    message: 'Please check the required fields and try again.',
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Store Profile" />

            <form onSubmit={submit} className="flex h-full flex-1 flex-col gap-5 p-4 md:p-6">
                <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-background shadow-sm">
                    <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.08]">
                        {coverPreview && <img src={coverPreview} alt="Store cover background" className="h-full w-full object-cover" />}
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-muted/50" />
                    <div className="absolute -right-20 -top-20 size-64 rounded-full bg-primary/10 blur-3xl" />
                    <div className="absolute -bottom-24 left-10 size-64 rounded-full bg-blue-500/10 blur-3xl" />

                    <div className="relative p-5 md:p-6">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-lg border border-border/80 bg-background/80 px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm backdrop-blur">
                                    <Store className="size-3.5" />
                                    POS Branch Profile
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <div className="relative min-w-full sm:min-w-[330px]">
                                    <GitBranch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <select
                                        value={selectedBranchId}
                                        onChange={(e) => handleBranchChange(e.target.value)}
                                        className="h-11 w-full rounded-xl border border-border/80 bg-background/90 pl-10 pr-9 text-sm font-semibold text-foreground shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                    >
                                        {branches.map((branch) => (
                                            <option key={branch.id} value={String(branch.id)}>
                                                {branch.name}
                                                {branch.code ? ` (${branch.code})` : ''}
                                                {branch.is_main ? ' — Main' : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    disabled={form.processing || !selectedBranch}
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-50"
                                >
                                    <Save className="size-4" />
                                    {form.processing ? 'Saving...' : 'Save Profile'}
                                </button>
                            </div>
                        </div>

                        <div className="mt-6 overflow-hidden rounded-2xl border border-border/70 bg-background/80 shadow-sm backdrop-blur">
                            <div className="relative min-h-[260px]">
                                <div className="absolute inset-0">
                                    {coverPreview ? (
                                        <img src={coverPreview} alt="Store cover" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full bg-gradient-to-br from-muted via-background to-muted" />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-r from-background via-background/88 to-background/45" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-transparent to-background/50" />
                                </div>

                                <div className="relative min-h-[340px] p-5 md:p-6">
                                    <label className="absolute right-5 top-5 z-20 flex size-10 cursor-pointer items-center justify-center rounded-xl border border-white/15 bg-black/55 text-white shadow-lg backdrop-blur transition hover:bg-black/75">
                                        <Camera className="size-4" />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0] ?? null;
                                                form.setData('cover', file);
                                                setCoverPreviewUrl(file ? URL.createObjectURL(file) : cacheBust(selectedBranch?.cover_url ?? selectedBranch?.cover_path));
                                            }}
                                        />
                                    </label>

                                    <div className="flex min-h-[320px] flex-col justify-end pt-16 md:pt-24">
                                        <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
                                            <div className="relative">
                                                <div className="flex size-28 overflow-hidden rounded-2xl border border-border/80 bg-background shadow-xl ring-4 ring-background/70 md:size-32">
                                                    {logoPreview ? (
                                                        <img src={logoPreview} alt="Store logo" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center bg-muted">
                                                            <Store className="size-10 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </div>

                                                <label className="absolute -bottom-2 -right-2 flex size-9 cursor-pointer items-center justify-center rounded-xl border border-border bg-background text-foreground shadow-sm transition hover:bg-muted">
                                                    <Upload className="size-4" />
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0] ?? null;
                                                            form.setData('logo', file);
                                                            setLogoPreviewUrl(file ? URL.createObjectURL(file) : cacheBust(selectedBranch?.logo_url ?? selectedBranch?.logo_path));
                                                        }}
                                                    />
                                                </label>
                                            </div>

                                            <div className="max-w-3xl pb-1">
                                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                                                        <BadgeCheck className="size-3.5" />
                                                        {selectedBranch?.is_main ? 'Main Branch' : 'Branch'}
                                                    </span>

                                                    <span className="inline-flex rounded-lg border border-border/80 bg-background/70 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                                        {selectedBranch?.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>

                                                <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                                                    {form.data.store_name || 'Your Store Name'}
                                                </h2>

                                                <p className="mt-2 text-sm font-medium text-muted-foreground">
                                                    {selectedBranch?.name || 'Selected Branch'}
                                                    {selectedBranch?.code ? ` (${selectedBranch.code})` : ''}
                                                    {selectedBranch?.is_main ? ' — Main' : ''}
                                                </p>

                                                <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                                    {form.data.business_type && (
                                                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-background/70 px-2.5 py-1.5">
                                                            <Building2 className="size-3.5" />
                                                            {form.data.business_type}
                                                        </span>
                                                    )}

                                                    {form.data.email && (
                                                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-background/70 px-2.5 py-1.5">
                                                            <Mail className="size-3.5" />
                                                            {form.data.email}
                                                        </span>
                                                    )}

                                                    {form.data.phone && (
                                                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-background/70 px-2.5 py-1.5">
                                                            <Phone className="size-3.5" />
                                                            {form.data.phone}
                                                        </span>
                                                    )}

                                                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-background/70 px-2.5 py-1.5">
                                                        <Globe2 className="size-3.5" />
                                                        {form.data.currency} • {form.data.timezone}
                                                    </span>
                                                </div>

                                                {fullAddress && (
                                                    <p className="mt-3 flex max-w-3xl items-start gap-2 text-sm text-muted-foreground">
                                                        <MapPin className="mt-0.5 size-4 shrink-0" />
                                                        <span>{fullAddress}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {(form.errors.logo || form.errors.cover) && (
                            <div className="mt-3 text-xs font-medium text-red-600">{form.errors.logo || form.errors.cover}</div>
                        )}
                    </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-3">
                    <div className="space-y-5 lg:col-span-2">
                        <SectionCard
                            icon={<Building2 className="size-5" />}
                            title="Business Information"
                            description="Store identity and branch-specific business details."
                        >
                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Store Name" error={form.errors.store_name}>
                                    <input
                                        value={form.data.store_name}
                                        onChange={(e) => form.setData('store_name', e.target.value)}
                                        className={inputClassName}
                                        placeholder="e.g. JCM Mini Mart"
                                    />
                                </Field>

                                <Field label="Business Type" error={form.errors.business_type}>
                                    <select
                                        value={form.data.business_type}
                                        onChange={(e) => form.setData('business_type', e.target.value)}
                                        className={selectClassName}
                                    >
                                        <option value="">Select business type</option>
                                        <option value="Retail Store">Retail Store</option>
                                        <option value="Grocery">Grocery</option>
                                        <option value="Convenience Store">Convenience Store</option>
                                        <option value="Restaurant / Cafe">Restaurant / Cafe</option>
                                        <option value="Pharmacy">Pharmacy</option>
                                        <option value="Hardware">Hardware</option>
                                        <option value="Services">Services</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </Field>

                                <Field label="Branch Email" error={form.errors.email}>
                                    <input
                                        type="email"
                                        value={form.data.email}
                                        onChange={(e) => form.setData('email', e.target.value)}
                                        className={inputClassName}
                                        placeholder="branch@email.com"
                                    />
                                </Field>

                                <Field label="Branch Phone" error={form.errors.phone}>
                                    <input
                                        value={form.data.phone}
                                        onChange={(e) => form.setData('phone', e.target.value)}
                                        className={inputClassName}
                                        placeholder="09xxxxxxxxx"
                                    />
                                </Field>

                                <Field label="TIN" error={form.errors.tin}>
                                    <input
                                        value={form.data.tin}
                                        onChange={(e) => form.setData('tin', e.target.value)}
                                        className={inputClassName}
                                        placeholder="Optional"
                                    />
                                </Field>

                                <Field label="Business Permit No." error={form.errors.permit_no}>
                                    <input
                                        value={form.data.permit_no}
                                        onChange={(e) => form.setData('permit_no', e.target.value)}
                                        className={inputClassName}
                                        placeholder="Optional"
                                    />
                                </Field>
                            </div>

                            <Field label="Description" error={form.errors.description}>
                                <textarea
                                    rows={3}
                                    value={form.data.description}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                    className={textareaClassName}
                                    placeholder="Short description of this branch..."
                                />
                            </Field>
                        </SectionCard>

                        <SectionCard icon={<MapPin className="size-5" />} title="Branch Address" description="Address for the selected branch.">
                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Address Line" error={form.errors.address_line}>
                                    <input
                                        value={form.data.address_line}
                                        onChange={(e) => form.setData('address_line', e.target.value)}
                                        className={inputClassName}
                                        placeholder="Street, building, unit no."
                                    />
                                </Field>

                                <Field label="Barangay" error={form.errors.barangay}>
                                    <input
                                        value={form.data.barangay}
                                        onChange={(e) => form.setData('barangay', e.target.value)}
                                        className={inputClassName}
                                        placeholder="Barangay"
                                    />
                                </Field>

                                <Field label="City / Municipality" error={form.errors.city}>
                                    <input
                                        value={form.data.city}
                                        onChange={(e) => form.setData('city', e.target.value)}
                                        className={inputClassName}
                                        placeholder="City / Municipality"
                                    />
                                </Field>

                                <Field label="Province" error={form.errors.province}>
                                    <input
                                        value={form.data.province}
                                        onChange={(e) => form.setData('province', e.target.value)}
                                        className={inputClassName}
                                        placeholder="Province"
                                    />
                                </Field>

                                <Field label="Postal Code" error={form.errors.postal_code}>
                                    <input
                                        value={form.data.postal_code}
                                        onChange={(e) => form.setData('postal_code', e.target.value)}
                                        className={inputClassName}
                                        placeholder="Postal code"
                                    />
                                </Field>

                                <Field label="Country" error={form.errors.country}>
                                    <input
                                        value={form.data.country}
                                        onChange={(e) => form.setData('country', e.target.value)}
                                        className={inputClassName}
                                        placeholder="Country"
                                    />
                                </Field>
                            </div>
                        </SectionCard>

                        <SectionCard
                            icon={<ReceiptText className="size-5" />}
                            title="Branch Receipt Settings"
                            description="Receipt settings for the selected branch."
                        >
                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Currency" error={form.errors.currency}>
                                    <select
                                        value={form.data.currency}
                                        onChange={(e) => form.setData('currency', e.target.value)}
                                        className={selectClassName}
                                    >
                                        <option value="PHP">PHP - Philippine Peso</option>
                                        <option value="USD">USD - US Dollar</option>
                                    </select>
                                </Field>

                                <Field label="Timezone" error={form.errors.timezone}>
                                    <select
                                        value={form.data.timezone}
                                        onChange={(e) => form.setData('timezone', e.target.value)}
                                        className={selectClassName}
                                    >
                                        <option value="Asia/Manila">Asia/Manila</option>
                                    </select>
                                </Field>
                            </div>

                            <Field label="Receipt Header" error={form.errors.receipt_header}>
                                <textarea
                                    rows={3}
                                    value={form.data.receipt_header}
                                    onChange={(e) => form.setData('receipt_header', e.target.value)}
                                    className={textareaClassName}
                                    placeholder="Welcome to our store!"
                                />
                            </Field>

                            <Field label="Receipt Footer" error={form.errors.receipt_footer}>
                                <textarea
                                    rows={3}
                                    value={form.data.receipt_footer}
                                    onChange={(e) => form.setData('receipt_footer', e.target.value)}
                                    className={textareaClassName}
                                    placeholder="Thank you for shopping with us."
                                />
                            </Field>
                        </SectionCard>
                    </div>

                    <div className="space-y-5">
                        <Card tone="topline" variant="default" className="overflow-hidden border border-border/80 shadow-sm">
                            <CardHeader className="border-b border-border/80 p-5">
                                <CardTitle className="text-lg">Receipt Preview</CardTitle>
                                <CardDescription>Preview for the selected branch.</CardDescription>
                            </CardHeader>

                            <CardContent className="p-5">
                                <div className="rounded-xl border border-border/80 bg-background p-5 font-mono text-sm shadow-sm">
                                    <div className="text-center">
                                        {logoPreview && <img src={logoPreview} alt="Logo preview" className="mx-auto mb-3 size-14 rounded object-cover" />}

                                        <div className="font-bold uppercase">{form.data.store_name || 'STORE NAME'}</div>
                                        <div className="mt-1 text-xs text-muted-foreground">{selectedBranch?.name || 'Branch'}</div>

                                        {fullAddress && <div className="mt-2 text-xs">{fullAddress}</div>}
                                        {form.data.phone && <div className="text-xs">Tel: {form.data.phone}</div>}
                                        {form.data.tin && <div className="text-xs">TIN: {form.data.tin}</div>}
                                    </div>

                                    <div className="my-4 border-t border-dashed border-border" />
                                    <div className="text-xs">{form.data.receipt_header || 'Receipt header message...'}</div>
                                    <div className="my-4 border-t border-dashed border-border" />

                                    <div className="space-y-1 text-xs">
                                        <div className="flex justify-between">
                                            <span>Sample Item</span>
                                            <span>₱100.00</span>
                                        </div>
                                        <div className="flex justify-between font-bold">
                                            <span>Total</span>
                                            <span>₱100.00</span>
                                        </div>
                                    </div>

                                    <div className="my-4 border-t border-dashed border-border" />
                                    <div className="text-center text-xs">{form.data.receipt_footer || 'Thank you for shopping with us.'}</div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card tone="topline" variant="success" className="border border-border/80 shadow-sm">
                            <CardContent className="p-5">
                                <div className="flex items-start gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-lg bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300">
                                        <Store className="size-5" />
                                    </div>

                                    <div>
                                        <h3 className="font-medium">Branch Based Profile</h3>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Address, contact, and receipt settings are saved per selected branch.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {saveModal.open && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
                        <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <div
                                        className={
                                            saveModal.type === 'success'
                                                ? 'flex size-11 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                                                : 'flex size-11 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                                        }
                                    >
                                        {saveModal.type === 'success' ? <CheckCircle2 className="size-6" /> : <AlertCircle className="size-6" />}
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold">{saveModal.title}</h3>
                                        <p className="mt-1 text-sm text-muted-foreground">{saveModal.message}</p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setSaveModal((prev) => ({ ...prev, open: false }))}
                                    className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                                >
                                    <X className="size-5" />
                                </button>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setSaveModal((prev) => ({ ...prev, open: false }))}
                                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
                                >
                                    Okay
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </form>
        </AppLayout>
    );
}

const inputClassName =
    'h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500';

const selectClassName =
    'h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100';

const textareaClassName =
    'min-h-24 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500';

function SectionCard({ icon, title, description, children }: { icon: ReactNode; title: string; description: string; children: ReactNode }) {
    return (
        <Card tone="topline" variant="default" className="overflow-hidden border border-border/80 shadow-sm">
            <CardHeader className="border-b border-border/80 p-5">
                <div className="flex items-start gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground ring-1 ring-border/70">
                        {icon}
                    </div>

                    <div>
                        <CardTitle className="text-lg">{title}</CardTitle>
                        <CardDescription className="mt-1">{description}</CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-5 p-5">{children}</CardContent>
        </Card>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-foreground">{label}</label>
            {children}
            {error && <p className="text-xs font-medium text-red-600">{error}</p>}
        </div>
    );
}