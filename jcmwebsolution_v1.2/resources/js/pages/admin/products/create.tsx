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

type ProductFormData = {
    name: string;
    description: string;
    pricing_type: 'plan' | 'custom';
    price: number | '';
    status: 'active' | 'inactive';
    features: Feature[];
    overviews: Overview[];
    images: File[];
};

export default function AddProduct() {
    const form = useForm<ProductFormData>({
        name: '',
        description: '',
        pricing_type: 'plan',
        price: '',
        status: 'active',
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

            <div className="min-h-screen bg-[#f6f8fb] pb-10">
                <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-6">
                    <section className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-sm">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                            <div className="max-w-3xl">
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-100">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Admin Product Setup
                                </div>

                                <h1 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
                                    Create New Product
                                </h1>

                                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
                                    Add a new SaaS product, organize its highlights, upload images,
                                    and prepare its overview content for the storefront and ordering flow.
                                </p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                                        Pricing Mode
                                    </p>
                                    <p className="mt-2 text-lg font-bold text-white">
                                        {form.data.pricing_type === 'plan' ? 'Plan Based' : 'Custom'}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                                        Current Status
                                    </p>
                                    <p className="mt-2 text-lg font-bold capitalize text-white">
                                        {form.data.status}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1fr_340px]">
                        <div className="space-y-6">
                            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-2xl bg-slate-900 p-3 text-white">
                                        <Blocks className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">
                                            Product Details
                                        </h2>
                                        <p className="text-sm text-slate-500">
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
                                            className="min-h-[110px] w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-900"
                                            value={form.data.description}
                                            onChange={(e) => form.setData('description', e.target.value)}
                                            placeholder="Write a short product description..."
                                        />
                                        <InputError message={form.errors.description} />
                                    </div>

                                    <div className="grid gap-5 md:grid-cols-2">
                                        <div>
                                            <Label className="mb-2 block">Pricing Type</Label>
                                            <select
                                                className="h-11 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-slate-900"
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
                                                className="h-11 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-slate-900"
                                                value={form.data.status}
                                                onChange={(e) =>
                                                    form.setData(
                                                        'status',
                                                        e.target.value as 'active' | 'inactive',
                                                    )
                                                }
                                            >
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                            </select>
                                            <InputError message={form.errors.status} />
                                        </div>
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

                            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-2xl bg-amber-500 p-3 text-white">
                                            <FileImage className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900">Product Images</h2>
                                            <p className="text-sm text-slate-500">
                                                Upload multiple images. The first image will be used as the thumbnail.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 space-y-4">
                                    <div>
                                        <Label className="mb-2 block">Upload Images</Label>
                                        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:bg-slate-100">
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
                                        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
                                            <p className="text-sm text-slate-400">No images selected yet.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {form.data.images.map((image, index) => (
                                                <div
                                                    key={`${image.name}-${index}`}
                                                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4"
                                                >
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">
                                                            {image.name}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
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

                            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-2xl bg-blue-600 p-3 text-white">
                                            <ClipboardList className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900">Features</h2>
                                            <p className="text-sm text-slate-500">
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
                                    <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
                                        <p className="text-sm text-slate-400">No features added yet.</p>
                                    </div>
                                ) : (
                                    <div className="mt-5 space-y-3">
                                        {form.data.features.map((feature, index) => (
                                            <div
                                                key={index}
                                                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center"
                                            >
                                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-sm font-bold text-slate-700 shadow-sm">
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

                            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-2xl bg-slate-900 p-3 text-white">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900">
                                                Product Overview
                                            </h2>
                                            <p className="text-sm text-slate-500">
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
                                    <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
                                        <p className="text-sm text-slate-400">No overview sections added yet.</p>
                                    </div>
                                ) : (
                                    <div className="mt-5 space-y-4">
                                        {form.data.overviews.map((overview, index) => (
                                            <div
                                                key={index}
                                                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                                            >
                                                <div className="mb-3 flex items-center justify-between gap-3">
                                                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
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
                                                        className="min-h-[130px] w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-900"
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
                            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                                <div className="border-b border-slate-200 bg-gradient-to-r from-slate-950 to-slate-800 px-6 py-5 text-white">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-2xl bg-white/10 p-3">
                                            <Settings2 className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
                                                Live Summary
                                            </p>
                                            <h3 className="mt-1 text-xl font-bold">
                                                {form.data.name || 'New Product'}
                                            </h3>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 p-6">
                                    <div className="rounded-2xl bg-slate-50 p-4">
                                        <p className="text-xs uppercase tracking-wide text-slate-400">
                                            Pricing Type
                                        </p>
                                        <p className="mt-1 text-sm font-semibold capitalize text-slate-900">
                                            {form.data.pricing_type === 'plan' ? 'Plan Based' : 'Custom'}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl bg-slate-50 p-4">
                                        <p className="text-xs uppercase tracking-wide text-slate-400">
                                            Status
                                        </p>
                                        <p className="mt-1 text-sm font-semibold capitalize text-slate-900">
                                            {form.data.status}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl bg-slate-50 p-4">
                                        <p className="text-xs uppercase tracking-wide text-slate-400">
                                            Images
                                        </p>
                                        <p className="mt-1 text-sm font-semibold text-slate-900">
                                            {form.data.images.length}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl bg-slate-50 p-4">
                                        <p className="text-xs uppercase tracking-wide text-slate-400">
                                            Features
                                        </p>
                                        <p className="mt-1 text-sm font-semibold text-slate-900">
                                            {form.data.features.length}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl bg-slate-50 p-4">
                                        <p className="text-xs uppercase tracking-wide text-slate-400">
                                            Overview Sections
                                        </p>
                                        <p className="mt-1 text-sm font-semibold text-slate-900">
                                            {form.data.overviews.length}
                                        </p>
                                    </div>

                                    {form.data.images.length > 0 && (
                                        <div className="rounded-2xl bg-slate-50 p-4">
                                            <p className="text-xs uppercase tracking-wide text-slate-400">
                                                Thumbnail Source
                                            </p>
                                            <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                                                {form.data.images[0].name}
                                            </p>
                                        </div>
                                    )}

                                    {form.data.pricing_type === 'custom' && (
                                        <div className="rounded-2xl bg-slate-50 p-4">
                                            <p className="text-xs uppercase tracking-wide text-slate-400">
                                                Base Price
                                            </p>
                                            <p className="mt-1 text-sm font-semibold text-slate-900">
                                                {form.data.price === '' ? '—' : `₱${form.data.price}`}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
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