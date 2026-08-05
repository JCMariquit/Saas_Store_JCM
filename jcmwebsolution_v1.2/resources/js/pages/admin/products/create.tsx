import { Head, router, useForm } from '@inertiajs/react';
import {
    Blocks,
    ClipboardList,
    FileImage,
    FileText,
    Plus,
    Settings2,
    Sparkles,
    Trash2,
    Upload,
} from 'lucide-react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/admin-layout';

type Feature = {
    title: string;
}; 

type Overview = {
    title: string;
    content: string;
};

type ProductStatus = 'development' | 'active' | 'maintenance' | 'paused' | 'inactive';

type ProductFormData = {
    name: string;
    description: string;
    app_url: string;
    pricing_type: 'plan' | 'custom';
    price: number | '';
    status: ProductStatus;
    sort_order: number | '';
    features: Feature[];
    overviews: Overview[];
    images: File[];
};

export default function AddProduct() {
    const form = useForm<ProductFormData>({
        name: '',
        description: '',
        app_url: '',
        pricing_type: 'plan',
        price: '',
        status: 'active',
        sort_order: 0,
        features: [],
        overviews: [],
        images: [],
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        form.post(route('admin.products.store'), {
            forceFormData: true,
        });
    };

    const addFeature = () => {
        form.setData('features', [...form.data.features, { title: '' }]);
    };

    const removeFeature = (index: number) => {
        const updated = [...form.data.features];
        updated.splice(index, 1);
        form.setData('features', updated);
    };

    const updateFeature = (index: number, value: string) => {
        const updated = [...form.data.features];
        updated[index] = {
            ...updated[index],
            title: value,
        };
        form.setData('features', updated);
    };

    const addOverview = () => {
        form.setData('overviews', [
            ...form.data.overviews,
            { title: '', content: '' },
        ]);
    };

    const removeOverview = (index: number) => {
        const updated = [...form.data.overviews];
        updated.splice(index, 1);
        form.setData('overviews', updated);
    };

    const updateOverview = (index: number, field: keyof Overview, value: string) => {
        const updated = [...form.data.overviews];
        updated[index] = {
            ...updated[index],
            [field]: value,
        };
        form.setData('overviews', updated);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        form.setData('images', files);
    };

    const removeImage = (index: number) => {
        const updated = [...form.data.images];
        updated.splice(index, 1);
        form.setData('images', updated);
    };

    return (
        <AppLayout>
            <Head title="Add Product" />

            <div className="min-h-screen bg-background pb-10">
                <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-6">
                    <section className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/[0.14] via-card to-card p-6 text-foreground shadow-[0_18px_60px_var(--theme-glow)]">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                            <div className="max-w-3xl">
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-card/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Admin Product Setup
                                </div>

                                <h1 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
                                    Create New Product
                                </h1>

                                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                                    Add a new SaaS product, organize its highlights, upload images,
                                    and prepare its overview content for the storefront and ordering flow.
                                </p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl border border-white/10 bg-card/5 px-4 py-4">
                                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                                        Pricing Mode
                                    </p>
                                    <p className="mt-2 text-lg font-bold text-foreground">
                                        {form.data.pricing_type === 'plan' ? 'Plan Based' : 'Custom'}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-card/5 px-4 py-4">
                                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                                        Current Status
                                    </p>
                                    <p className="mt-2 text-lg font-bold capitalize text-foreground">
                                        {form.data.status}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1fr_340px]">
                        <div className="space-y-6">
                            <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                                        <Blocks className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-foreground">
                                            Product Details
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            Basic information for your product listing and detail page.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 grid gap-5">
                                    <div>
                                        <Label className="mb-2 block">Product Name</Label>
                                        <Input
                                            value={form.data.name}
                                            onChange={(e) => form.setData('name', e.target.value)}
                                            placeholder="Enter product name"
                                        />
                                        <InputError message={form.errors.name} />
                                    </div>

                                    <div>
                                        <Label className="mb-2 block">Short Description</Label>
                                        <textarea
                                            className="min-h-[110px] w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary"
                                            value={form.data.description}
                                            onChange={(e) => form.setData('description', e.target.value)}
                                            placeholder="Write a short product description..."
                                        />
                                        <InputError message={form.errors.description} />
                                    </div>

                                    <div>
                                        <Label className="mb-2 block">Application URL</Label>
                                        <Input
                                            type="url"
                                            value={form.data.app_url}
                                            onChange={(e) => form.setData('app_url', e.target.value)}
                                            placeholder="https://inventory.example.com"
                                        />
                                        <InputError message={form.errors.app_url} />
                                    </div>

                                    <div className="grid gap-5 md:grid-cols-2">
                                        <div>
                                            <Label className="mb-2 block">Pricing Type</Label>
                                            <select
                                                className="h-11 w-full rounded-2xl border border-border bg-card px-4 text-sm text-foreground outline-none transition focus:border-primary"
                                                value={form.data.pricing_type}
                                                onChange={(e) =>
                                                    form.setData(
                                                        'pricing_type',
                                                        e.target.value as 'plan' | 'custom',
                                                    )
                                                }
                                            >
                                                <option value="plan">Plan Based</option>
                                                <option value="custom">Custom</option>
                                            </select>
                                            <InputError message={form.errors.pricing_type} />
                                        </div>

                                        <div>
                                            <Label className="mb-2 block">Status</Label>
                                            <select
                                                className="h-11 w-full rounded-2xl border border-border bg-card px-4 text-sm text-foreground outline-none transition focus:border-primary"
                                                value={form.data.status}
                                                onChange={(e) =>
                                                    form.setData(
                                                        'status',
                                                        e.target.value as ProductStatus,
                                                    )
                                                }
                                            >
                                                <option value="development">Development</option>
                                                <option value="active">Active</option>
                                                <option value="maintenance">Maintenance</option>
                                                <option value="paused">Paused</option>
                                                <option value="inactive">Inactive</option>
                                            </select>
                                            <InputError message={form.errors.status} />
                                        </div>
                                    </div>


                                    <div className="max-w-sm">
                                        <Label className="mb-2 block">Catalog Sort Order</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            value={form.data.sort_order}
                                            onChange={(e) => form.setData('sort_order', e.target.value === '' ? '' : Number(e.target.value))}
                                            placeholder="0"
                                        />
                                        <InputError message={form.errors.sort_order} />
                                    </div>

                                    {form.data.pricing_type === 'custom' && (
                                        <div className="max-w-sm">
                                            <Label className="mb-2 block">Base Price</Label>
                                            <Input
                                                type="number"
                                                value={form.data.price}
                                                onChange={(e) =>
                                                    form.setData(
                                                        'price',
                                                        e.target.value === ''
                                                            ? ''
                                                            : Number(e.target.value),
                                                    )
                                                }
                                                placeholder="0.00"
                                            />
                                            <InputError message={form.errors.price} />
                                        </div>
                                    )}
                                </div>
                            </section>

                            <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-2xl bg-amber-500 p-3 text-foreground">
                                            <FileImage className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-foreground">Product Images</h2>
                                            <p className="text-sm text-muted-foreground">
                                                Upload multiple images. The first image will be used as the thumbnail.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 space-y-4">
                                    <div>
                                        <Label className="mb-2 block">Upload Images</Label>
                                        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-6 text-sm font-medium text-muted-foreground transition hover:border-border hover:bg-muted">
                                            <Upload className="h-4 w-4" />
                                            Select Images
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleImageChange}
                                            />
                                        </label>
                                        <InputError message={form.errors.images as string} />
                                    </div>

                                    {form.data.images.length === 0 ? (
                                        <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
                                            <p className="text-sm text-muted-foreground">No images selected yet.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {form.data.images.map((image, index) => (
                                                <div
                                                    key={`${image.name}-${index}`}
                                                    className="flex items-center justify-between rounded-2xl border border-border bg-muted/30 p-4"
                                                >
                                                    <div>
                                                        <p className="text-sm font-semibold text-foreground">
                                                            {image.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {index === 0 ? 'Thumbnail Image' : `Image ${index + 1}`}
                                                        </p>
                                                    </div>

                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => removeImage(index)}
                                                        className="rounded-2xl"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Remove
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </section>

                            <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-2xl bg-primary p-3 text-foreground">
                                            <ClipboardList className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-foreground">Features</h2>
                                            <p className="text-sm text-muted-foreground">
                                                Short highlights or selling points of the product.
                                            </p>
                                        </div>
                                    </div>

                                    <Button type="button" onClick={addFeature} className="rounded-2xl">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Feature
                                    </Button>
                                </div>

                                {form.data.features.length === 0 ? (
                                    <div className="mt-5 rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
                                        <p className="text-sm text-muted-foreground">No features added yet.</p>
                                    </div>
                                ) : (
                                    <div className="mt-5 space-y-3">
                                        {form.data.features.map((feature, index) => (
                                            <div
                                                key={index}
                                                className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/30 p-4 md:flex-row md:items-center"
                                            >
                                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-card text-sm font-bold text-foreground shadow-sm">
                                                    {index + 1}
                                                </div>

                                                <div className="flex-1">
                                                    <Input
                                                        value={feature.title}
                                                        onChange={(e) =>
                                                            updateFeature(index, e.target.value)
                                                        }
                                                        placeholder={`Feature ${index + 1}`}
                                                    />
                                                    <InputError
                                                        message={
                                                            (form.errors as Record<string, string>)[
                                                                `features.${index}.title`
                                                            ]
                                                        }
                                                    />
                                                </div>

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => removeFeature(index)}
                                                    className="rounded-2xl"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Remove
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-foreground">
                                                Product Overview
                                            </h2>
                                            <p className="text-sm text-muted-foreground">
                                                Add content sections for the detailed product page.
                                            </p>
                                        </div>
                                    </div>

                                    <Button type="button" onClick={addOverview} className="rounded-2xl">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Section
                                    </Button>
                                </div>

                                {form.data.overviews.length === 0 ? (
                                    <div className="mt-5 rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
                                        <p className="text-sm text-muted-foreground">No overview sections added yet.</p>
                                    </div>
                                ) : (
                                    <div className="mt-5 space-y-4">
                                        {form.data.overviews.map((overview, index) => (
                                            <div
                                                key={index}
                                                className="rounded-2xl border border-border bg-muted/30 p-4"
                                            >
                                                <div className="mb-3 flex items-center justify-between gap-3">
                                                    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
                                                        Section {index + 1}
                                                    </div>

                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => removeOverview(index)}
                                                        className="rounded-2xl"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Remove
                                                    </Button>
                                                </div>

                                                <div className="space-y-3">
                                                    <Input
                                                        placeholder="Section Title"
                                                        value={overview.title}
                                                        onChange={(e) =>
                                                            updateOverview(index, 'title', e.target.value)
                                                        }
                                                    />
                                                    <InputError
                                                        message={
                                                            (form.errors as Record<string, string>)[
                                                                `overviews.${index}.title`
                                                            ]
                                                        }
                                                    />

                                                    <textarea
                                                        className="min-h-[130px] w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary"
                                                        placeholder="Content..."
                                                        value={overview.content}
                                                        onChange={(e) =>
                                                            updateOverview(index, 'content', e.target.value)
                                                        }
                                                    />
                                                    <InputError
                                                        message={
                                                            (form.errors as Record<string, string>)[
                                                                `overviews.${index}.content`
                                                            ]
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </div>

                        <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
                            <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
                                <div className="border-b border-border bg-gradient-to-r from-slate-950 to-slate-800 px-6 py-5 text-foreground">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-2xl bg-card/10 p-3">
                                            <Settings2 className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                                Live Summary
                                            </p>
                                            <h3 className="mt-1 text-xl font-bold">
                                                {form.data.name || 'New Product'}
                                            </h3>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 p-6">
                                    <div className="rounded-2xl bg-muted/30 p-4">
                                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                            Pricing Type
                                        </p>
                                        <p className="mt-1 text-sm font-semibold capitalize text-foreground">
                                            {form.data.pricing_type === 'plan' ? 'Plan Based' : 'Custom'}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl bg-muted/30 p-4">
                                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                            Status
                                        </p>
                                        <p className="mt-1 text-sm font-semibold capitalize text-foreground">
                                            {form.data.status}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl bg-muted/30 p-4">
                                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                            Images
                                        </p>
                                        <p className="mt-1 text-sm font-semibold text-foreground">
                                            {form.data.images.length}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl bg-muted/30 p-4">
                                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                            Features
                                        </p>
                                        <p className="mt-1 text-sm font-semibold text-foreground">
                                            {form.data.features.length}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl bg-muted/30 p-4">
                                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                            Overview Sections
                                        </p>
                                        <p className="mt-1 text-sm font-semibold text-foreground">
                                            {form.data.overviews.length}
                                        </p>
                                    </div>

                                    {form.data.images.length > 0 && (
                                        <div className="rounded-2xl bg-muted/30 p-4">
                                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                                Thumbnail Source
                                            </p>
                                            <p className="mt-1 truncate text-sm font-semibold text-foreground">
                                                {form.data.images[0].name}
                                            </p>
                                        </div>
                                    )}

                                    {form.data.pricing_type === 'custom' && (
                                        <div className="rounded-2xl bg-muted/30 p-4">
                                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                                Base Price
                                            </p>
                                            <p className="mt-1 text-sm font-semibold text-foreground">
                                                {form.data.price === '' ? '—' : `₱${form.data.price}`}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            <div className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-5 shadow-sm">
                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                    className="rounded-2xl"
                                >
                                    {form.processing ? 'Saving...' : 'Create Product'}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.visit(route('admin.products.index'))}
                                    className="rounded-2xl"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </aside>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}