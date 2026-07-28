import { FormField } from '@/components/shared/form-field';
import { PageContainer } from '@/components/shared/page-container';
import { SectionCard } from '@/components/shared/section-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import {
    Head,
    Link,
    useForm,
} from '@inertiajs/react';
import {
    Building2,
    Image as ImageIcon,
    LoaderCircle,
    Palette,
    Save,
    ShieldCheck,
    Trash2,
    UploadCloud,
} from 'lucide-react';
import {
    type FormEvent,
    useEffect,
    useMemo,
    useState,
} from 'react';

type BrandingData = {
    tagline: string;
    logo_alt_text: string;
    logo_url: string | null;
    square_logo_url: string | null;
    favicon_url: string | null;
    updated_at: string | null;
};

type PageProps = {
    branding: BrandingData;
    business_name: string;
};

type BrandingForm = {
    tagline: string;
    logo_alt_text: string;
    logo: File | null;
    square_logo: File | null;
    favicon: File | null;
    remove_logo: boolean;
    remove_square_logo: boolean;
    remove_favicon: boolean;
};

type ProfileTabProps = {
    href: string;
    label: string;
    active: boolean;
};

type AssetUploadProps = {
    id: string;
    title: string;
    description: string;
    recommendation: string;
    previewUrl: string | null;
    currentUrl: string | null;
    file: File | null;
    removed: boolean;
    accept: string;
    processing: boolean;
    error?: string;
    previewClassName?: string;
    onFileChange: (file: File | null) => void;
    onRemoveChange: (removed: boolean) => void;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Business Profile',
        href: '/management/business-profile/general',
    },
    {
        title: 'Branding',
        href: '/management/business-profile/branding',
    },
];

function ProfileTab({
    href,
    label,
    active,
}: ProfileTabProps) {
    return (
        <Link
            href={href}
            className={cn(
                'inline-flex h-9 items-center justify-center rounded-lg px-3 text-[11px] font-semibold transition',
                active
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
            )}
        >
            {label}
        </Link>
    );
}

function useObjectUrl(
    file: File | null,
): string | null {
    const [url, setUrl] =
        useState<string | null>(null);

    useEffect(() => {
        if (!file) {
            setUrl(null);
            return;
        }

        const objectUrl =
            URL.createObjectURL(file);

        setUrl(objectUrl);

        return () =>
            URL.revokeObjectURL(objectUrl);
    }, [file]);

    return url;
}

function formatUpdatedAt(
    value: string | null,
): string {
    if (!value) {
        return 'Not saved yet';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat(
        'en-PH',
        {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        },
    ).format(date);
}

function AssetUpload({
    id,
    title,
    description,
    recommendation,
    previewUrl,
    currentUrl,
    file,
    removed,
    accept,
    processing,
    error,
    previewClassName,
    onFileChange,
    onRemoveChange,
}: AssetUploadProps) {
    return (
        <article className="overflow-hidden rounded-xl border border-border/70 bg-background/20">
            <div className="flex flex-col gap-3 border-b border-border/60 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className="text-xs font-semibold text-foreground">
                        {title}
                    </p>

                    <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
                        {description}
                    </p>
                </div>

                <Badge
                    variant="outline"
                    className="h-5 w-fit shrink-0 rounded-full border-border/60 bg-muted/20 px-2 text-[8px] text-muted-foreground"
                >
                    {recommendation}
                </Badge>
            </div>

            <div className="grid gap-4 p-4 sm:grid-cols-[130px_minmax(0,1fr)] sm:items-center">
                <div className="flex h-28 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border/70 bg-muted/[0.025]">
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt={`${title} preview`}
                            className={cn(
                                'max-h-full max-w-full object-contain p-3',
                                previewClassName,
                            )}
                        />
                    ) : (
                        <div className="text-center text-muted-foreground">
                            <ImageIcon className="mx-auto size-5 opacity-60" />

                            <p className="mt-2 text-[9px]">
                                No image
                            </p>
                        </div>
                    )}
                </div>

                <div className="min-w-0 space-y-3">
                    <FormField
                        id={id}
                        label={`Choose ${title}`}
                        error={error}
                    >
                        <Input
                            id={id}
                            type="file"
                            accept={accept}
                            disabled={processing}
                            onChange={(event) => {
                                const nextFile =
                                    event.target.files?.[0]
                                    ?? null;

                                onFileChange(nextFile);

                                if (nextFile) {
                                    onRemoveChange(false);
                                }
                            }}
                            className="cursor-pointer file:cursor-pointer"
                        />
                    </FormField>

                    <div className="flex flex-wrap items-center gap-2">
                        {(currentUrl || file)
                            && !removed && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={processing}
                                    onClick={() => {
                                        onFileChange(null);
                                        onRemoveChange(true);
                                    }}
                                    className="h-8 border-rose-500/20 text-[10px] text-rose-400 hover:bg-rose-500/[0.07] hover:text-rose-300"
                                >
                                    <Trash2 className="size-3.5" />
                                    Remove
                                </Button>
                            )}

                        {removed && currentUrl && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={processing}
                                onClick={() =>
                                    onRemoveChange(false)
                                }
                                className="h-8 text-[10px]"
                            >
                                Restore current image
                            </Button>
                        )}

                        <span className="min-w-0 truncate text-[9px] text-muted-foreground">
                            {file
                                ? file.name
                                : removed
                                  ? 'Marked for removal'
                                  : currentUrl
                                    ? 'Current image retained'
                                    : 'No file selected'}
                        </span>
                    </div>
                </div>
            </div>
        </article>
    );
}

export default function BusinessProfileBranding({
    branding,
    business_name,
}: PageProps) {
    const form = useForm<BrandingForm>({
        tagline: branding.tagline,
        logo_alt_text:
            branding.logo_alt_text,

        logo: null,
        square_logo: null,
        favicon: null,

        remove_logo: false,
        remove_square_logo: false,
        remove_favicon: false,
    });

    const logoObjectUrl =
        useObjectUrl(form.data.logo);

    const squareLogoObjectUrl =
        useObjectUrl(form.data.square_logo);

    const faviconObjectUrl =
        useObjectUrl(form.data.favicon);

    const logoPreview =
        logoObjectUrl
        ?? (
            form.data.remove_logo
                ? null
                : branding.logo_url
        );

    const squareLogoPreview =
        squareLogoObjectUrl
        ?? (
            form.data.remove_square_logo
                ? null
                : branding.square_logo_url
        );

    const faviconPreview =
        faviconObjectUrl
        ?? (
            form.data.remove_favicon
                ? null
                : branding.favicon_url
        );

    const assetCount = useMemo(() => {
        return [
            logoPreview,
            squareLogoPreview,
            faviconPreview,
        ].filter(Boolean).length;
    }, [
        faviconPreview,
        logoPreview,
        squareLogoPreview,
    ]);

    function submit(
        event: FormEvent<HTMLFormElement>,
    ): void {
        event.preventDefault();

        form.post(
            '/management/business-profile/branding',
            {
                forceFormData: true,
                preserveScroll: true,

                onSuccess: () => {
                    form.reset(
                        'logo',
                        'square_logo',
                        'favicon',
                        'remove_logo',
                        'remove_square_logo',
                        'remove_favicon',
                    );
                },
            },
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Business Profile - Branding" />

            <PageContainer className="gap-4 px-3 pb-6 sm:px-5 md:gap-5 lg:px-6">
                <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                    <div className="flex flex-col gap-4 border-b border-border/60 px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 items-start gap-3">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/[0.08] text-primary">
                                <Palette className="size-4.5" />
                            </span>

                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-lg font-semibold text-foreground sm:text-xl">
                                        Business Profile
                                    </h1>

                                    <Badge
                                        variant="outline"
                                        className="h-5 rounded-full border-emerald-500/20 bg-emerald-500/[0.06] px-2 text-[8px] font-semibold text-emerald-400"
                                    >
                                        <ShieldCheck className="mr-1 size-2.5" />
                                        Owner only
                                    </Badge>
                                </div>

                                <p className="mt-1 max-w-2xl text-[11px] leading-5 text-muted-foreground">
                                    Manage the shared visual identity of {business_name}.
                                </p>
                            </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-3 rounded-xl border border-border/60 bg-muted/[0.025] px-3 py-2.5">
                            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/[0.08] text-primary">
                                <ImageIcon className="size-4" />
                            </span>

                            <div>
                                <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                                    Brand assets
                                </p>

                                <p className="mt-0.5 text-[10px] font-medium text-foreground">
                                    {assetCount} of 3 configured
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-1 overflow-x-auto px-3 py-2">
                        <ProfileTab
                            href="/management/business-profile/general"
                            label="General Information"
                            active={false}
                        />

                        <ProfileTab
                            href="/management/business-profile/branding"
                            label="Branding"
                            active
                        />
                    </div>
                </section>

                <form
                    onSubmit={submit}
                    className="space-y-4 md:space-y-5"
                >
                    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px] xl:gap-6">
                        <div className="min-w-0 space-y-4 px-0.5 sm:px-1">
                            <SectionCard
                                title="Brand Details"
                                description="Set the business tagline and accessible logo text."
                            >
                                <div className="px-3 pb-3 sm:px-4 sm:pb-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <FormField
                                        id="tagline"
                                        label="Tagline"
                                        description="Optional short phrase displayed with the business identity."
                                        error={form.errors.tagline}
                                    >
                                        <Input
                                            id="tagline"
                                            value={form.data.tagline}
                                            disabled={form.processing}
                                            onChange={(event) =>
                                                form.setData(
                                                    'tagline',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Reliable inventory, simplified."
                                        />
                                    </FormField>

                                    <FormField
                                        id="logo_alt_text"
                                        label="Logo Alternative Text"
                                        description="Used for accessibility and when an image cannot load."
                                        error={form.errors.logo_alt_text}
                                    >
                                        <Input
                                            id="logo_alt_text"
                                            value={form.data.logo_alt_text}
                                            disabled={form.processing}
                                            onChange={(event) =>
                                                form.setData(
                                                    'logo_alt_text',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder={`${business_name} logo`}
                                        />
                                    </FormField>

                                </div>
                                </div>
                            </SectionCard>

                            <SectionCard
                                title="Brand Assets"
                                description="Upload the images used by connected JCM products. Files are stored on the configured public disk."
                            >
                                <div className="px-3 pb-3 sm:px-4 sm:pb-4">
                                <div className="space-y-4">
                                    <AssetUpload
                                        id="logo"
                                        title="Main Logo"
                                        description="Best for headers, reports, and wide layouts."
                                        recommendation="Wide logo"
                                        previewUrl={logoPreview}
                                        currentUrl={branding.logo_url}
                                        file={form.data.logo}
                                        removed={form.data.remove_logo}
                                        accept=".jpg,.jpeg,.png,.webp"
                                        processing={form.processing}
                                        error={form.errors.logo}
                                        onFileChange={(file) =>
                                            form.setData(
                                                'logo',
                                                file,
                                            )
                                        }
                                        onRemoveChange={(removed) =>
                                            form.setData(
                                                'remove_logo',
                                                removed,
                                            )
                                        }
                                    />

                                    <AssetUpload
                                        id="square_logo"
                                        title="Square Logo"
                                        description="Used for avatars, compact cards, and mobile surfaces."
                                        recommendation="1:1 ratio"
                                        previewUrl={squareLogoPreview}
                                        currentUrl={branding.square_logo_url}
                                        file={form.data.square_logo}
                                        removed={
                                            form.data.remove_square_logo
                                        }
                                        accept=".jpg,.jpeg,.png,.webp"
                                        processing={form.processing}
                                        error={form.errors.square_logo}
                                        previewClassName="aspect-square"
                                        onFileChange={(file) =>
                                            form.setData(
                                                'square_logo',
                                                file,
                                            )
                                        }
                                        onRemoveChange={(removed) =>
                                            form.setData(
                                                'remove_square_logo',
                                                removed,
                                            )
                                        }
                                    />

                                    <AssetUpload
                                        id="favicon"
                                        title="Favicon"
                                        description="Small icon for browser tabs and compact product surfaces."
                                        recommendation="32×32 or 64×64"
                                        previewUrl={faviconPreview}
                                        currentUrl={branding.favicon_url}
                                        file={form.data.favicon}
                                        removed={form.data.remove_favicon}
                                        accept=".ico,.png,.jpg,.jpeg,.webp"
                                        processing={form.processing}
                                        error={form.errors.favicon}
                                        previewClassName="max-h-14 max-w-14"
                                        onFileChange={(file) =>
                                            form.setData(
                                                'favicon',
                                                file,
                                            )
                                        }
                                        onRemoveChange={(removed) =>
                                            form.setData(
                                                'remove_favicon',
                                                removed,
                                            )
                                        }
                                    />
                                </div>
                                </div>
                            </SectionCard>

                            <section className="rounded-2xl border border-border/70 bg-card px-4 py-4 shadow-sm sm:px-5">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-foreground">
                                            Save branding changes
                                        </p>

                                        <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
                                            Apply the updated tagline, logos, favicon, and file removals to the central business profile.
                                        </p>

                                        {form.isDirty && (
                                            <p className="mt-2 text-[10px] font-medium text-amber-400">
                                                You have unsaved changes.
                                            </p>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={
                                            form.processing
                                            || !form.isDirty
                                        }
                                        className="w-full shrink-0 sm:w-auto sm:min-w-40"
                                    >
                                        {form.processing ? (
                                            <LoaderCircle className="size-4 animate-spin" />
                                        ) : (
                                            <Save className="size-4" />
                                        )}

                                        {form.processing
                                            ? 'Saving...'
                                            : 'Save Branding'}
                                    </Button>
                                </div>
                            </section>
                        </div>

                        <aside className="space-y-4 px-0.5 sm:px-1 xl:sticky xl:top-4 xl:self-start">
                            <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                                <div className="p-4">
                                    <div className="flex min-h-28 items-center justify-center rounded-xl border border-border/60 bg-muted/[0.025] p-4">
                                        {logoPreview ? (
                                            <img
                                                src={logoPreview}
                                                alt={
                                                    form.data.logo_alt_text
                                                    || `${business_name} logo`
                                                }
                                                className="max-h-20 max-w-full object-contain"
                                            />
                                        ) : (
                                            <div className="text-center text-muted-foreground">
                                                <Building2 className="mx-auto size-7" />

                                                <p className="mt-2 text-[9px]">
                                                    Main logo preview
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4">
                                        <p className="text-base font-semibold text-foreground">
                                            {business_name}
                                        </p>

                                        <p className="mt-1 min-h-4 text-[10px] text-muted-foreground">
                                            {form.data.tagline.trim()
                                                || 'Your business tagline will appear here.'}
                                        </p>
                                    </div>

                                    <div className="mt-4 flex items-center gap-3 rounded-xl border border-border/60 bg-muted/[0.025] p-3">
                                        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-background">
                                            {squareLogoPreview ? (
                                                <img
                                                    src={squareLogoPreview}
                                                    alt="Square logo preview"
                                                    className="max-h-full max-w-full object-contain p-1"
                                                />
                                            ) : (
                                                <ImageIcon className="size-4 text-muted-foreground" />
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                                                Compact identity
                                            </p>

                                            <p className="mt-0.5 truncate text-[10px] font-medium text-foreground">
                                                {business_name}
                                            </p>
                                        </div>

                                        <div className="ml-auto flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-background">
                                            {faviconPreview ? (
                                                <img
                                                    src={faviconPreview}
                                                    alt="Favicon preview"
                                                    className="max-h-5 max-w-5 object-contain"
                                                />
                                            ) : (
                                                <span className="text-[9px] text-muted-foreground">
                                                    Icon
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <UploadCloud className="mt-0.5 size-4 shrink-0 text-primary" />

                                    <div>
                                        <p className="text-xs font-semibold text-foreground">
                                            Storage note
                                        </p>

                                        <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
                                            Uploaded files are saved as paths, not image data inside the database.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 border-t border-border/60 pt-3">
                                    <p className="text-[8px] uppercase tracking-[0.1em] text-muted-foreground">
                                        Last updated
                                    </p>

                                    <p className="mt-1 text-[10px] font-medium text-foreground">
                                        {formatUpdatedAt(
                                            branding.updated_at,
                                        )}
                                    </p>
                                </div>
                            </section>
                        </aside>
                    </div>

                </form>
            </PageContainer>
        </AppLayout>
    );
}