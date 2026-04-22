import { Head, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    House,
    ImageOff,
    LoaderCircle,
    Package,
    ShoppingCart,
    Wallet,
    XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';

type PlanItem = {
    id: number;
    name: string;
    description: string | null;
    price: number | null;
    price_label: string;
    billing_cycle: string | null;
    duration_days: number | null;
    status: string;
};

type ProductItem = {
    id: number;
    name: string;
    description: string | null;
    pricing_type: string;
};

type PaymentMethodItem = {
    value: string;
    label: string;
};

type BillingTypeOption = {
    value: string;
    label: string;
};

type PageProps = {
    product: ProductItem;
    plans: PlanItem[];
    selected_plan_id?: number | null;
    payment_methods: PaymentMethodItem[];
    billing_type_options: BillingTypeOption[];
};

type SubmitModalState = 'idle' | 'submitting' | 'success' | 'error';

export default function Create({
    product,
    plans,
    selected_plan_id,
    payment_methods,
    billing_type_options,
}: PageProps) {
    const isPlanProduct = product.pricing_type === 'plan';
    const isCustomProduct = product.pricing_type === 'custom';

    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [submitModalState, setSubmitModalState] =
        useState<SubmitModalState>('idle');
    const [countdown, setCountdown] = useState(10);
    const [successOrderCode, setSuccessOrderCode] = useState<string | null>(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        product_id: product.id,
        plan_id: selected_plan_id ? String(selected_plan_id) : '',
        billing_type: isPlanProduct ? 'monthly' : 'custom',
        notes: '',
        payment_method: 'gcash',
        reference_number: '',
        payment_proof: null as File | null,
    });

    const selectedPlan =
        plans.find((plan) => String(plan.id) === String(data.plan_id)) ?? null;

    const computedPriceLabel = useMemo(() => {
        if (!selectedPlan) return '—';

        if (data.billing_type === 'yearly' && selectedPlan.price !== null) {
            return `₱${Number(selectedPlan.price * 12).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}`;
        }

        return selectedPlan.price_label;
    }, [selectedPlan, data.billing_type]);

    const disableSubmit =
        processing ||
        (isPlanProduct && !data.plan_id) ||
        !data.payment_method ||
        !data.reference_number;

    const closeModal = () => {
        if (submitModalState === 'submitting') return;
        setShowSubmitModal(false);
        setSubmitModalState('idle');
        setCountdown(10);
    };

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        clearErrors();
        setShowSubmitModal(true);
        setSubmitModalState('submitting');
        setCountdown(10);
        setSuccessOrderCode(null);

        post('/orders', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: (page) => {
                reset('notes', 'reference_number', 'payment_proof');
                setSubmitModalState('success');
                setCountdown(10);

                const props = page.props as Record<string, unknown>;
                const flash =
                    props.flash && typeof props.flash === 'object'
                        ? (props.flash as Record<string, unknown>)
                        : null;

                const orderCode =
                    flash && typeof flash.order_code === 'string'
                        ? flash.order_code
                        : null;

                setSuccessOrderCode(orderCode);
            },
            onError: () => {
                setSubmitModalState('idle');
                setShowSubmitModal(false);
                setCountdown(10);
            },
            onCancel: () => {
                setSubmitModalState('idle');
                setShowSubmitModal(false);
                setCountdown(10);
            },
        });
    };

    useEffect(() => {
        if (!showSubmitModal || submitModalState !== 'success') return;

        if (countdown <= 0) {
            router.visit('/');
            return;
        }

        const timer = window.setTimeout(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        return () => window.clearTimeout(timer);
    }, [showSubmitModal, submitModalState, countdown]);

    return (
        <AppLayout fullWidth>
            <Head title={`Order ${product.name}`} />

            <div className="min-h-screen bg-[#f6f8fb] pb-10">
                <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
                    <button
                        type="button"
                        onClick={() => router.visit('/dashboard')}
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Store
                    </button>

                    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="rounded-2xl bg-slate-900 p-3 text-white">
                                    <ShoppingCart className="h-5 w-5" />
                                </div>

                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900">
                                        Order & Payment
                                    </h1>
                                    <p className="text-sm text-slate-500">
                                        Complete your order and payment details in one submission.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                                    Product
                                </p>

                                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                                    {product.name}
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    {product.description || 'No product description available.'}
                                </p>

                                <div className="mt-4 inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold capitalize text-slate-600">
                                    Pricing Type: {product.pricing_type}
                                </div>
                            </div>

                            <form onSubmit={submit} className="mt-6 space-y-6">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Select Plan
                                        {isPlanProduct ? (
                                            <span className="ml-1 text-red-500">*</span>
                                        ) : null}
                                    </label>

                                    <select
                                        value={data.plan_id}
                                        onChange={(e) => setData('plan_id', e.target.value)}
                                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-900"
                                    >
                                        <option value="">Select a plan</option>
                                        {plans.map((plan) => (
                                            <option key={plan.id} value={plan.id}>
                                                {plan.name} — {plan.price_label}
                                            </option>
                                        ))}
                                    </select>

                                    {errors.plan_id && (
                                        <p className="mt-2 text-sm text-red-600">{errors.plan_id}</p>
                                    )}
                                </div>

                                {isPlanProduct ? (
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            Billing Type <span className="text-red-500">*</span>
                                        </label>

                                        <select
                                            value={data.billing_type}
                                            onChange={(e) => setData('billing_type', e.target.value)}
                                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-900"
                                        >
                                            {billing_type_options.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>

                                        {errors.billing_type && (
                                            <p className="mt-2 text-sm text-red-600">
                                                {errors.billing_type}
                                            </p>
                                        )}
                                    </div>
                                ) : null}

                                {isCustomProduct ? (
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                        <p className="text-sm font-semibold text-slate-700">
                                            Billing Type
                                        </p>
                                        <p className="mt-1 text-sm text-slate-600">Custom</p>
                                    </div>
                                ) : null}

                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                    <div className="flex items-center gap-2">
                                        <Wallet className="h-5 w-5 text-slate-700" />
                                        <h3 className="text-lg font-bold text-slate-900">
                                            Payment Details
                                        </h3>
                                    </div>

                                    <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-6">
                                        <div className="flex flex-col items-center justify-center text-center">
                                            <div className="rounded-2xl bg-slate-100 p-3">
                                                <ImageOff className="h-8 w-8 text-slate-500" />
                                            </div>
                                            <p className="mt-3 text-sm font-semibold text-slate-700">
                                                QR Code Placeholder
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                Put your GCash or Maya QR image here later.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                                Payment Method <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={data.payment_method}
                                                onChange={(e) => setData('payment_method', e.target.value)}
                                                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-900"
                                            >
                                                {payment_methods.map((method) => (
                                                    <option key={method.value} value={method.value}>
                                                        {method.label}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.payment_method && (
                                                <p className="mt-2 text-sm text-red-600">
                                                    {errors.payment_method}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                                Reference Number <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.reference_number}
                                                onChange={(e) => setData('reference_number', e.target.value)}
                                                placeholder="Enter payment reference number"
                                                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-900"
                                            />
                                            {errors.reference_number && (
                                                <p className="mt-2 text-sm text-red-600">
                                                    {errors.reference_number}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            Payment Proof
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) =>
                                                setData('payment_proof', e.target.files?.[0] ?? null)
                                            }
                                            className="block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700"
                                        />
                                        {errors.payment_proof && (
                                            <p className="mt-2 text-sm text-red-600">
                                                {errors.payment_proof}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Notes / Requirements
                                    </label>

                                    <textarea
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        rows={5}
                                        placeholder="Add your business requirements, setup requests, or other notes here..."
                                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-900"
                                    />

                                    {errors.notes && (
                                        <p className="mt-2 text-sm text-red-600">{errors.notes}</p>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <Button
                                        type="submit"
                                        disabled={disableSubmit}
                                        className="rounded-2xl px-5 py-3"
                                    >
                                        {processing ? 'Submitting...' : 'Submit Order & Payment'}
                                    </Button>
                                </div>
                            </form>
                        </div>

                        <aside className="lg:sticky lg:top-6 lg:self-start">
                            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                                <div className="border-b border-slate-200 bg-gradient-to-r from-slate-950 to-slate-800 px-6 py-5 text-white">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-2xl bg-white/10 p-3">
                                            <Package className="h-5 w-5" />
                                        </div>

                                        <div>
                                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
                                                Order Summary
                                            </p>
                                            <h3 className="mt-1 text-xl font-bold">{product.name}</h3>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="space-y-4">
                                        <div className="rounded-2xl bg-slate-50 p-4">
                                            <p className="text-xs uppercase tracking-wide text-slate-400">
                                                Selected Plan
                                            </p>
                                            <p className="mt-1 text-lg font-bold text-slate-900">
                                                {selectedPlan?.name || 'No plan selected yet'}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl bg-slate-50 p-4">
                                            <p className="text-xs uppercase tracking-wide text-slate-400">
                                                Billing Type
                                            </p>
                                            <p className="mt-1 text-sm font-semibold capitalize text-slate-900">
                                                {data.billing_type}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl bg-slate-50 p-4">
                                            <p className="text-xs uppercase tracking-wide text-slate-400">
                                                Price
                                            </p>
                                            <p className="mt-1 text-2xl font-extrabold text-blue-600">
                                                {computedPriceLabel}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl bg-slate-50 p-4">
                                            <p className="text-xs uppercase tracking-wide text-slate-400">
                                                Payment Method
                                            </p>
                                            <p className="mt-1 text-sm font-semibold capitalize text-slate-900">
                                                {data.payment_method || 'Not selected'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-5 space-y-3 text-sm text-slate-500">
                                        <div className="flex items-start gap-2">
                                            <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600" />
                                            <span>Order and payment will be submitted together.</span>
                                        </div>

                                        <div className="flex items-start gap-2">
                                            <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600" />
                                            <span>Reference number will be saved with the payment record.</span>
                                        </div>

                                        <div className="flex items-start gap-2">
                                            <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600" />
                                            <span>Next step is admin verification of your payment.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>

            {showSubmitModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-xl rounded-[28px] border border-slate-200 bg-white p-8 shadow-2xl">
                        {submitModalState === 'submitting' && (
                            <>
                                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
                                    <LoaderCircle className="h-11 w-11 animate-spin text-blue-600" />
                                </div>

                                <div className="mt-5 text-center">
                                    <h2 className="text-2xl font-bold text-slate-900">
                                        Processing your order
                                    </h2>
                                    <p className="mt-3 text-sm leading-7 text-slate-500">
                                        Please wait while we submit your order and payment details.
                                        Do not close this window while processing is in progress.
                                    </p>
                                </div>

                                <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4">
                                    <p className="text-sm font-semibold text-blue-800">
                                        Submitting...
                                    </p>
                                    <p className="mt-1 text-sm leading-6 text-blue-700">
                                        Your order is currently being saved. The success confirmation
                                        will appear automatically once submission is completed.
                                    </p>
                                </div>
                            </>
                        )}

                        {submitModalState === 'success' && (
                            <>
                                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
                                    <CheckCircle2 className="h-11 w-11 text-green-600" />
                                </div>

                                <div className="mt-5 text-center">
                                    <h2 className="text-2xl font-bold text-slate-900">
                                        Order submitted successfully
                                    </h2>

                                    <p className="mt-3 text-sm leading-7 text-slate-500">
                                        Your order has been submitted successfully. Please make sure
                                        your reference number is correct and matches your payment
                                        transaction. Incorrect or unmatched payment details may
                                        result in rejection during verification.
                                    </p>
                                </div>

                                {successOrderCode && (
                                    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                                        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                                            Order Reference
                                        </p>
                                        <p className="mt-1 text-lg font-bold text-slate-900">
                                            {successOrderCode}
                                        </p>
                                    </div>
                                )}

                                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
                                    <p className="text-sm font-semibold text-amber-800">
                                        Important Reminder
                                    </p>
                                    <p className="mt-1 text-sm leading-6 text-amber-700">
                                        Please ensure that your submitted reference number is accurate
                                        and matches your payment transaction. Invalid or incorrect
                                        reference details may cause your order to be rejected during
                                        the verification process.
                                    </p>
                                </div>

                                <div className="mt-6 rounded-2xl bg-slate-900 px-4 py-3 text-center text-white">
                                    <p className="text-sm font-medium">
                                        Redirecting back to home page in{' '}
                                        <span className="font-bold text-green-400">{countdown}</span>{' '}
                                        second{countdown === 1 ? '' : 's'}...
                                    </p>
                                </div>

                                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                    <Button
                                        type="button"
                                        onClick={() => router.visit('/dashboard')}
                                        className="flex-1 rounded-2xl bg-slate-950 px-5 py-3 text-white hover:bg-slate-800"
                                    >
                                        <House className="mr-2 h-4 w-4" />
                                        Back to Home Page
                                    </Button>
                                </div>
                            </>
                        )}

                        {submitModalState === 'error' && (
                            <>
                                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
                                    <XCircle className="h-11 w-11 text-red-600" />
                                </div>

                                <div className="mt-5 text-center">
                                    <h2 className="text-2xl font-bold text-slate-900">
                                        Submission failed
                                    </h2>
                                    <p className="mt-3 text-sm leading-7 text-slate-500">
                                        Please review the form fields and try again.
                                    </p>
                                </div>

                                <div className="mt-6">
                                    <Button
                                        type="button"
                                        onClick={closeModal}
                                        className="w-full rounded-2xl px-5 py-3"
                                    >
                                        Close
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </AppLayout>
    );
}