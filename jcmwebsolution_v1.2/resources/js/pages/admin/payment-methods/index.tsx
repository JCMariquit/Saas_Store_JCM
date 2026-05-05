import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/admin-layout';
import { Head, router, useForm } from '@inertiajs/react';
import {
    CheckCircle2,
    CreditCard,
    FileImage,
    LoaderCircle,
    Pencil,
    Settings2,
    Sparkles,
    Trash2,
    Upload,
    Wallet,
    X,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

type PaymentMethod = {
    id: number;
    name: string;
    slug: string;
    account_name: string | null;
    account_number: string | null;
    account_owner: string | null;
    image_path: string | null;
    instructions: string | null;
    status: boolean;
    sort_order: number;
    created_at: string | null;
};

type PageProps = {
    paymentMethods: PaymentMethod[];
};

type FormData = {
    name: string;
    slug: string;
    account_name: string;
    account_number: string;
    account_owner: string;
    instructions: string;
    status: boolean;
    sort_order: number | '';
    image: File | null;
};

type ModalType = 'loading' | 'success' | 'error';

export default function PaymentMethodsIndex({ paymentMethods }: PageProps) {
    const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState<ModalType>('loading');

    const form = useForm<FormData>({
        name: '',
        slug: '',
        account_name: '',
        account_number: '',
        account_owner: '',
        instructions: '',
        status: true,
        sort_order: 0,
        image: null,
    });

    const isEditing = !!editingMethod;

    const resetForm = () => {
        setEditingMethod(null);
        form.reset();
        form.clearErrors();
        form.setData({
            name: '',
            slug: '',
            account_name: '',
            account_number: '',
            account_owner: '',
            instructions: '',
            status: true,
            sort_order: 0,
            image: null,
        });
    };

    const closeModal = () => {
        if (modalType === 'loading') return;
        setShowModal(false);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        setShowModal(true);
        setModalType('loading');

        if (editingMethod) {
            form.post(route('admin.payment-methods.update', editingMethod.id), {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    setModalType('success');
                    resetForm();
                },
                onError: () => {
                    setModalType('error');
                },
            });

            return;
        }

        form.post(route('admin.payment-methods.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setModalType('success');
                resetForm();
            },
            onError: () => {
                setModalType('error');
            },
        });
    };

    const editMethod = (method: PaymentMethod) => {
        setEditingMethod(method);

        form.setData({
            name: method.name ?? '',
            slug: method.slug ?? '',
            account_name: method.account_name ?? '',
            account_number: method.account_number ?? '',
            account_owner: method.account_owner ?? '',
            instructions: method.instructions ?? '',
            status: method.status,
            sort_order: method.sort_order ?? 0,
            image: null,
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const deleteMethod = (method: PaymentMethod) => {
        if (!confirm(`Delete ${method.name}?`)) return;

        router.delete(route('admin.payment-methods.destroy', method.id), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <Head title="Payment Methods" />

            <div className="min-h-screen bg-[#f6f8fb] pb-10">
                <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-6">
                    <section className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-sm">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                            <div className="max-w-3xl">
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-100">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Admin Payment Setup
                                </div>

                                <h1 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
                                    Manage Payment Methods
                                </h1>

                                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
                                    Add and manage GCash, Maya, bank transfer, QR image,
                                    account display name, masked account number, and payment instructions.
                                </p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                                        Total Methods
                                    </p>
                                    <p className="mt-2 text-lg font-bold text-white">
                                        {paymentMethods.length}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                                        Active
                                    </p>
                                    <p className="mt-2 text-lg font-bold text-white">
                                        {paymentMethods.filter((item) => item.status).length}
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
                                        <Wallet className="h-5 w-5" />
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">
                                            {isEditing ? 'Edit Payment Method' : 'Add Payment Method'}
                                        </h2>
                                        <p className="text-sm text-slate-500">
                                            This will be displayed on the customer order payment page.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 grid gap-5">
                                    <div className="grid gap-5 md:grid-cols-2">
                                        <div>
                                            <Label className="mb-2 block">Payment Method Name</Label>
                                            <Input
                                                value={form.data.name}
                                                onChange={(e) => form.setData('name', e.target.value)}
                                                placeholder="Example: GCash"
                                            />
                                            <InputError message={form.errors.name} />
                                        </div>

                                        <div>
                                            <Label className="mb-2 block">Slug</Label>
                                            <Input
                                                value={form.data.slug}
                                                onChange={(e) => form.setData('slug', e.target.value)}
                                                placeholder="Example: gcash"
                                            />
                                            <InputError message={form.errors.slug} />
                                        </div>
                                    </div>

                                    <div className="grid gap-5 md:grid-cols-2">
                                        <div>
                                            <Label className="mb-2 block">Display Account Name</Label>
                                            <Input
                                                value={form.data.account_name}
                                                onChange={(e) =>
                                                    form.setData('account_name', e.target.value)
                                                }
                                                placeholder="Example: J*** Web Solution"
                                            />
                                            <InputError message={form.errors.account_name} />
                                        </div>

                                        <div>
                                            <Label className="mb-2 block">Display Account Number</Label>
                                            <Input
                                                value={form.data.account_number}
                                                onChange={(e) =>
                                                    form.setData('account_number', e.target.value)
                                                }
                                                placeholder="Example: 09XX XXX XXXX"
                                            />
                                            <InputError message={form.errors.account_number} />
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="mb-2 block">Account Owner</Label>
                                        <Input
                                            value={form.data.account_owner}
                                            onChange={(e) =>
                                                form.setData('account_owner', e.target.value)
                                            }
                                            placeholder="Optional internal/admin reference"
                                        />
                                        <p className="mt-1 text-xs text-slate-500">
                                            Optional. This does not need to be displayed publicly.
                                        </p>
                                        <InputError message={form.errors.account_owner} />
                                    </div>

                                    <div>
                                        <Label className="mb-2 block">Instructions</Label>
                                        <textarea
                                            className="min-h-[120px] w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-900"
                                            value={form.data.instructions}
                                            onChange={(e) =>
                                                form.setData('instructions', e.target.value)
                                            }
                                            placeholder="Example: Scan the QR code or send payment to the displayed number. Upload receipt and reference number after payment."
                                        />
                                        <InputError message={form.errors.instructions} />
                                    </div>

                                    <div className="grid gap-5 md:grid-cols-2">
                                        <div>
                                            <Label className="mb-2 block">Status</Label>
                                            <select
                                                className="h-11 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-slate-900"
                                                value={form.data.status ? '1' : '0'}
                                                onChange={(e) =>
                                                    form.setData('status', e.target.value === '1')
                                                }
                                            >
                                                <option value="1">Active</option>
                                                <option value="0">Inactive</option>
                                            </select>
                                            <InputError message={form.errors.status} />
                                        </div>

                                        <div>
                                            <Label className="mb-2 block">Sort Order</Label>
                                            <Input
                                                type="number"
                                                value={form.data.sort_order}
                                                onChange={(e) =>
                                                    form.setData(
                                                        'sort_order',
                                                        e.target.value === ''
                                                            ? ''
                                                            : Number(e.target.value),
                                                    )
                                                }
                                                placeholder="0"
                                            />
                                            <InputError message={form.errors.sort_order} />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-2xl bg-blue-600 p-3 text-white">
                                        <FileImage className="h-5 w-5" />
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">
                                            Payment QR Image
                                        </h2>
                                        <p className="text-sm text-slate-500">
                                            Upload the QR code image for this payment method.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 space-y-4">
                                    <div>
                                        <Label className="mb-2 block">Upload QR Image</Label>
                                        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:bg-slate-100">
                                            <Upload className="h-4 w-4" />
                                            Select QR Image
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) =>
                                                    form.setData(
                                                        'image',
                                                        e.target.files?.[0] ?? null,
                                                    )
                                                }
                                            />
                                        </label>
                                        <InputError message={form.errors.image} />
                                    </div>

                                    {form.data.image ? (
                                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                            <p className="text-sm font-semibold text-slate-900">
                                                {form.data.image.name}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                New image selected
                                            </p>
                                        </div>
                                    ) : editingMethod?.image_path ? (
                                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                            <p className="mb-3 text-sm font-semibold text-slate-900">
                                                Current QR Image
                                            </p>
                                            <img
                                                src={editingMethod.image_path}
                                                alt={editingMethod.name}
                                                className="h-40 w-40 rounded-2xl border border-slate-200 bg-white object-contain p-2"
                                            />
                                        </div>
                                    ) : (
                                        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
                                            <p className="text-sm text-slate-400">
                                                No QR image selected yet.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-2xl bg-slate-900 p-3 text-white">
                                        <CreditCard className="h-5 w-5" />
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">
                                            Payment Method List
                                        </h2>
                                        <p className="text-sm text-slate-500">
                                            Manage active and inactive payment methods.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-3">
                                    {paymentMethods.length === 0 ? (
                                        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
                                            <p className="text-sm text-slate-400">
                                                No payment methods added yet.
                                            </p>
                                        </div>
                                    ) : (
                                        paymentMethods.map((method) => (
                                            <div
                                                key={method.id}
                                                className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white">
                                                        {method.image_path ? (
                                                            <img
                                                                src={method.image_path}
                                                                alt={method.name}
                                                                className="h-full w-full object-contain p-1"
                                                            />
                                                        ) : (
                                                            <Wallet className="h-6 w-6 text-slate-400" />
                                                        )}
                                                    </div>

                                                    <div>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <p className="font-bold text-slate-900">
                                                                {method.name}
                                                            </p>

                                                            <span
                                                                className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                                                                    method.status
                                                                        ? 'bg-green-100 text-green-700'
                                                                        : 'bg-red-100 text-red-700'
                                                                }`}
                                                            >
                                                                {method.status ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </div>

                                                        <p className="mt-1 text-sm text-slate-500">
                                                            {method.account_name || 'No account name'} •{' '}
                                                            {method.account_number || 'No account number'}
                                                        </p>

                                                        <p className="mt-1 text-xs text-slate-400">
                                                            Sort: {method.sort_order} • Slug: {method.slug}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => editMethod(method)}
                                                        className="rounded-2xl"
                                                    >
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </Button>

                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => deleteMethod(method)}
                                                        className="rounded-2xl text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
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
                                                {form.data.name || 'New Payment Method'}
                                            </h3>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 p-6">
                                    <div className="rounded-2xl bg-slate-50 p-4">
                                        <p className="text-xs uppercase tracking-wide text-slate-400">
                                            Mode
                                        </p>
                                        <p className="mt-1 text-sm font-semibold text-slate-900">
                                            {isEditing ? 'Editing Existing Method' : 'Creating New Method'}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl bg-slate-50 p-4">
                                        <p className="text-xs uppercase tracking-wide text-slate-400">
                                            Status
                                        </p>
                                        <p className="mt-1 text-sm font-semibold capitalize text-slate-900">
                                            {form.data.status ? 'Active' : 'Inactive'}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl bg-slate-50 p-4">
                                        <p className="text-xs uppercase tracking-wide text-slate-400">
                                            Display Account
                                        </p>
                                        <p className="mt-1 text-sm font-semibold text-slate-900">
                                            {form.data.account_name || '—'}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl bg-slate-50 p-4">
                                        <p className="text-xs uppercase tracking-wide text-slate-400">
                                            Display Number
                                        </p>
                                        <p className="mt-1 text-sm font-semibold text-slate-900">
                                            {form.data.account_number || '—'}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl bg-slate-50 p-4">
                                        <p className="text-xs uppercase tracking-wide text-slate-400">
                                            QR Image
                                        </p>
                                        <p className="mt-1 text-sm font-semibold text-slate-900">
                                            {form.data.image
                                                ? form.data.image.name
                                                : editingMethod?.image_path
                                                  ? 'Current image retained'
                                                  : 'No image selected'}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                    className="rounded-2xl"
                                >
                                    {form.processing
                                        ? 'Saving...'
                                        : isEditing
                                          ? 'Update Payment Method'
                                          : 'Create Payment Method'}
                                </Button>

                                {isEditing ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={resetForm}
                                        className="rounded-2xl"
                                    >
                                        <X className="mr-2 h-4 w-4" />
                                        Cancel Edit
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.visit('/dashboard')}
                                        className="rounded-2xl"
                                    >
                                        Cancel
                                    </Button>
                                )}
                            </div>
                        </aside>
                    </form>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-2xl">
                        {modalType === 'loading' && (
                            <>
                                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
                                    <LoaderCircle className="h-11 w-11 animate-spin text-blue-700" />
                                </div>

                                <h2 className="mt-5 text-2xl font-bold text-slate-900">
                                    Saving payment method
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    Please wait while we save your payment method details.
                                </p>
                            </>
                        )}

                        {modalType === 'success' && (
                            <>
                                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
                                    <CheckCircle2 className="h-11 w-11 text-green-600" />
                                </div>

                                <h2 className="mt-5 text-2xl font-bold text-slate-900">
                                    Success
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    Payment method has been saved successfully.
                                </p>

                                <Button
                                    type="button"
                                    onClick={closeModal}
                                    className="mt-6 w-full rounded-2xl"
                                >
                                    Okay
                                </Button>
                            </>
                        )}

                        {modalType === 'error' && (
                            <>
                                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
                                    <XCircle className="h-11 w-11 text-red-600" />
                                </div>

                                <h2 className="mt-5 text-2xl font-bold text-slate-900">
                                    Failed
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    Please check the form fields and try again.
                                </p>

                                <Button
                                    type="button"
                                    onClick={closeModal}
                                    className="mt-6 w-full rounded-2xl bg-slate-950 text-white hover:bg-slate-800"
                                >
                                    Close
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </AppLayout>
    );
}