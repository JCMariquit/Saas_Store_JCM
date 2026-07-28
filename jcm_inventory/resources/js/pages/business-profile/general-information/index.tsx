import { FormField } from '@/components/shared/form-field';
import { PageContainer } from '@/components/shared/page-container';
import { SectionCard } from '@/components/shared/section-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
    CheckCircle2,
    Globe2,
    LoaderCircle,
    Mail,
    MapPin,
    Phone,
    Save,
    ShieldCheck,
} from 'lucide-react';
import {
    type FormEvent,
    useMemo,
} from 'react';

type BusinessProfileData = {
    business_name: string;
    business_category: string;
    short_description: string;
    contact_email: string;
    contact_phone: string;
    alternate_phone: string;
    website_url: string;
    facebook_url: string;
    address_line: string;
    barangay: string;
    city_municipality: string;
    province: string;
    postal_code: string;
    country_code: string;
    updated_at: string | null;
};

type OwnerInfo = {
    id: number;
    name: string;
    email: string;
};

type PageProps = {
    profile: BusinessProfileData;
    owner: OwnerInfo;
};

type ProfileTabProps = {
    href: string;
    label: string;
    active: boolean;
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
        title: 'General Information',
        href: '/management/business-profile/general',
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

export default function BusinessProfileGeneral({
    profile,
    owner,
}: PageProps) {
    const form = useForm({
        business_name:
            profile.business_name,

        business_category:
            profile.business_category,

        short_description:
            profile.short_description,

        contact_email:
            profile.contact_email,

        contact_phone:
            profile.contact_phone,

        alternate_phone:
            profile.alternate_phone,

        website_url:
            profile.website_url,

        facebook_url:
            profile.facebook_url,

        address_line:
            profile.address_line,

        barangay:
            profile.barangay,

        city_municipality:
            profile.city_municipality,

        province:
            profile.province,

        postal_code:
            profile.postal_code,

        country_code:
            profile.country_code || 'PH',
    });

    const completion = useMemo(() => {
        const values = [
            form.data.business_name,
            form.data.business_category,
            form.data.contact_email,
            form.data.contact_phone,
            form.data.address_line,
            form.data.city_municipality,
            form.data.province,
        ];

        const completed = values.filter(
            (value) => value.trim() !== '',
        ).length;

        return Math.round(
            (completed / values.length) * 100,
        );
    }, [form.data]);

    const locationPreview = useMemo(() => {
        return [
            form.data.address_line,
            form.data.barangay,
            form.data.city_municipality,
            form.data.province,
            form.data.postal_code,
        ]
            .map((value) => value.trim())
            .filter(Boolean)
            .join(', ');
    }, [
        form.data.address_line,
        form.data.barangay,
        form.data.city_municipality,
        form.data.province,
        form.data.postal_code,
    ]);

    function submit(
        event: FormEvent<HTMLFormElement>,
    ): void {
        event.preventDefault();

        form.post(
            '/management/business-profile/general',
            {
                preserveScroll: true,
            },
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Business Profile - General Information" />

            <PageContainer className="gap-4 px-3 pb-6 sm:px-5 md:gap-5 lg:px-6">
                <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                    <div className="flex flex-col gap-4 border-b border-border/60 px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 items-start gap-3">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/[0.08] text-primary">
                                <Building2 className="size-4.5" />
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
                                    Shared business identity for JCM Inventory and future connected products.
                                </p>
                            </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-3 rounded-xl border border-border/60 bg-muted/[0.025] px-3 py-2.5">
                            <div className="relative flex size-10 items-center justify-center rounded-full border border-border/70 bg-background">
                                <span className="text-xs font-semibold text-foreground">
                                    {completion}%
                                </span>
                            </div>

                            <div className="min-w-0">
                                <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                                    Profile completion
                                </p>

                                <p className="mt-0.5 max-w-44 truncate text-[10px] font-medium text-foreground">
                                    {owner.name}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-1 overflow-x-auto px-3 py-2">
                        <ProfileTab
                            href="/management/business-profile/general"
                            label="General Information"
                            active
                        />

                        <ProfileTab
                            href="/management/business-profile/branding"
                            label="Branding"
                            active={false}
                        />
                    </div>
                </section>

                <form
                    onSubmit={submit}
                    className="space-y-4 md:space-y-5"
                >
                    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_310px] xl:gap-6">
                        <div className="min-w-0 space-y-4 px-0.5 sm:px-1">
                            <SectionCard
                                title="Business Details"
                                description="Basic information used to identify the business across the system."
                            >
                                <div className="px-3 pb-3 sm:px-4 sm:pb-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <FormField
                                        id="business_name"
                                        label="Business Name"
                                        description="The main display name of the business."
                                        error={form.errors.business_name}
                                        required
                                    >
                                        <Input
                                            id="business_name"
                                            value={form.data.business_name}
                                            disabled={form.processing}
                                            onChange={(event) =>
                                                form.setData(
                                                    'business_name',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Example Trading"
                                            autoComplete="organization"
                                        />
                                    </FormField>

                                    <FormField
                                        id="business_category"
                                        label="Business Category"
                                        description="Example: Retail, Pharmacy, Hardware, or Distribution."
                                        error={form.errors.business_category}
                                    >
                                        <Input
                                            id="business_category"
                                            value={form.data.business_category}
                                            disabled={form.processing}
                                            onChange={(event) =>
                                                form.setData(
                                                    'business_category',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Retail"
                                            autoComplete="off"
                                        />
                                    </FormField>

                                    <div className="md:col-span-2">
                                        <FormField
                                            id="short_description"
                                            label="Short Description"
                                            description="A brief description of the business and what it provides."
                                            error={form.errors.short_description}
                                        >
                                            <Textarea
                                                id="short_description"
                                                rows={4}
                                                value={form.data.short_description}
                                                disabled={form.processing}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'short_description',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Describe the business in a few sentences."
                                                className="resize-none"
                                            />
                                        </FormField>
                                    </div>
                                </div>
                                </div>
                            </SectionCard>

                            <SectionCard
                                title="Contact Details"
                                description="Contact channels that may appear in connected pages, reports, or documents."
                            >
                                <div className="px-3 pb-3 sm:px-4 sm:pb-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <FormField
                                        id="contact_email"
                                        label="Contact Email"
                                        error={form.errors.contact_email}
                                    >
                                        <div className="relative">
                                            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                            <Input
                                                id="contact_email"
                                                type="email"
                                                value={form.data.contact_email}
                                                disabled={form.processing}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'contact_email',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="business@example.com"
                                                className="pl-9"
                                                autoComplete="email"
                                            />
                                        </div>
                                    </FormField>

                                    <FormField
                                        id="contact_phone"
                                        label="Primary Contact Number"
                                        error={form.errors.contact_phone}
                                    >
                                        <div className="relative">
                                            <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                            <Input
                                                id="contact_phone"
                                                type="tel"
                                                value={form.data.contact_phone}
                                                disabled={form.processing}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'contact_phone',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="+63 9XX XXX XXXX"
                                                className="pl-9"
                                                autoComplete="tel"
                                            />
                                        </div>
                                    </FormField>

                                    <FormField
                                        id="alternate_phone"
                                        label="Alternate Number"
                                        error={form.errors.alternate_phone}
                                    >
                                        <Input
                                            id="alternate_phone"
                                            type="tel"
                                            value={form.data.alternate_phone}
                                            disabled={form.processing}
                                            onChange={(event) =>
                                                form.setData(
                                                    'alternate_phone',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Optional alternate contact"
                                            autoComplete="off"
                                        />
                                    </FormField>

                                    <FormField
                                        id="website_url"
                                        label="Website"
                                        error={form.errors.website_url}
                                    >
                                        <div className="relative">
                                            <Globe2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                            <Input
                                                id="website_url"
                                                type="url"
                                                value={form.data.website_url}
                                                disabled={form.processing}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'website_url',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="https://example.com"
                                                className="pl-9"
                                                autoComplete="url"
                                            />
                                        </div>
                                    </FormField>

                                    <div className="md:col-span-2">
                                        <FormField
                                            id="facebook_url"
                                            label="Facebook Page"
                                            description="Use the complete Facebook page URL."
                                            error={form.errors.facebook_url}
                                        >
                                            <Input
                                                id="facebook_url"
                                                type="url"
                                                value={form.data.facebook_url}
                                                disabled={form.processing}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'facebook_url',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="https://facebook.com/your-page"
                                                autoComplete="url"
                                            />
                                        </FormField>
                                    </div>
                                </div>
                                </div>
                            </SectionCard>

                            <SectionCard
                                title="Primary Address"
                                description="The main business address. Individual branch addresses remain managed under Locations."
                            >
                                <div className="px-3 pb-3 sm:px-4 sm:pb-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="md:col-span-2">
                                        <FormField
                                            id="address_line"
                                            label="Address Line"
                                            error={form.errors.address_line}
                                        >
                                            <div className="relative">
                                                <MapPin className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" />

                                                <Input
                                                    id="address_line"
                                                    value={form.data.address_line}
                                                    disabled={form.processing}
                                                    onChange={(event) =>
                                                        form.setData(
                                                            'address_line',
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="Street, building, subdivision, or landmark"
                                                    className="pl-9"
                                                    autoComplete="street-address"
                                                />
                                            </div>
                                        </FormField>
                                    </div>

                                    <FormField
                                        id="barangay"
                                        label="Barangay"
                                        error={form.errors.barangay}
                                    >
                                        <Input
                                            id="barangay"
                                            value={form.data.barangay}
                                            disabled={form.processing}
                                            onChange={(event) =>
                                                form.setData(
                                                    'barangay',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Barangay"
                                            autoComplete="address-level3"
                                        />
                                    </FormField>

                                    <FormField
                                        id="city_municipality"
                                        label="City / Municipality"
                                        error={form.errors.city_municipality}
                                    >
                                        <Input
                                            id="city_municipality"
                                            value={form.data.city_municipality}
                                            disabled={form.processing}
                                            onChange={(event) =>
                                                form.setData(
                                                    'city_municipality',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="City or municipality"
                                            autoComplete="address-level2"
                                        />
                                    </FormField>

                                    <FormField
                                        id="province"
                                        label="Province"
                                        error={form.errors.province}
                                    >
                                        <Input
                                            id="province"
                                            value={form.data.province}
                                            disabled={form.processing}
                                            onChange={(event) =>
                                                form.setData(
                                                    'province',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Province"
                                            autoComplete="address-level1"
                                        />
                                    </FormField>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <FormField
                                            id="postal_code"
                                            label="Postal Code"
                                            error={form.errors.postal_code}
                                        >
                                            <Input
                                                id="postal_code"
                                                value={form.data.postal_code}
                                                disabled={form.processing}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'postal_code',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="4900"
                                                autoComplete="postal-code"
                                            />
                                        </FormField>

                                        <FormField
                                            id="country_code"
                                            label="Country"
                                            description="Two-letter country code."
                                            error={form.errors.country_code}
                                            required
                                        >
                                            <Input
                                                id="country_code"
                                                value={form.data.country_code}
                                                disabled={form.processing}
                                                maxLength={2}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'country_code',
                                                        event.target.value.toUpperCase(),
                                                    )
                                                }
                                                placeholder="PH"
                                                className="font-mono uppercase"
                                                autoComplete="country"
                                            />
                                        </FormField>
                                    </div>
                                </div>
                                </div>
                            </SectionCard>

                            <section className="rounded-2xl border border-border/70 bg-card px-4 py-4 shadow-sm sm:px-5">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-foreground">
                                            Save business information
                                        </p>

                                        <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
                                            Apply the updated business details, contact information, and primary address.
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
                                            : 'Save Information'}
                                    </Button>
                                </div>
                            </section>
                        </div>

                        <aside className="space-y-4 px-0.5 sm:px-1 xl:sticky xl:top-4 xl:self-start">
                            <section className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                            Profile preview
                                        </p>

                                        <h2 className="mt-1 text-sm font-semibold text-foreground">
                                            {form.data.business_name.trim()
                                                || 'Business name'}
                                        </h2>
                                    </div>

                                    <span className="flex size-9 items-center justify-center rounded-xl bg-primary/[0.08] text-primary">
                                        <Building2 className="size-4" />
                                    </span>
                                </div>

                                <div className="mt-4 space-y-3 border-t border-border/60 pt-4">
                                    <div>
                                        <p className="text-[8px] uppercase tracking-[0.1em] text-muted-foreground">
                                            Category
                                        </p>

                                        <p className="mt-1 text-[10px] text-foreground">
                                            {form.data.business_category.trim()
                                                || 'Not provided'}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[8px] uppercase tracking-[0.1em] text-muted-foreground">
                                            Contact
                                        </p>

                                        <p className="mt-1 break-words text-[10px] text-foreground">
                                            {form.data.contact_email.trim()
                                                || form.data.contact_phone.trim()
                                                || 'Not provided'}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[8px] uppercase tracking-[0.1em] text-muted-foreground">
                                            Main location
                                        </p>

                                        <p className="mt-1 text-[10px] leading-4 text-foreground">
                                            {locationPreview
                                                || 'Not provided'}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <section className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" />

                                    <div>
                                        <p className="text-xs font-semibold text-foreground">
                                            Central profile
                                        </p>

                                        <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
                                            These details are stored once and can be reused by other JCM systems under the same account.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 border-t border-border/60 pt-3">
                                    <p className="text-[8px] uppercase tracking-[0.1em] text-muted-foreground">
                                        Last updated
                                    </p>

                                    <p className="mt-1 text-[10px] font-medium text-foreground">
                                        {formatUpdatedAt(
                                            profile.updated_at,
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