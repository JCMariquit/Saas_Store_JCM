import { Head, router, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    House,
    ImageOff,
    LoaderCircle,
    Package,
    ShieldCheck,
    ShoppingCart,
    Sparkles,
    UploadCloud,
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

type ServiceItem = {
    id: number;
    name: string;
    description: string | null;
    service_type: string;
    pricing_type: string;
    base_price: number | null;
    base_price_label: string;
};

type PaymentMethodItem = {
    id: number;
    name: string;
    slug: string;
    account_name: string | null;
    account_number: string | null;
    account_owner: string | null;
    image_path: string | null;
    instructions: string | null;
};

type BillingTypeOption = {
    value: string;
    label: string;
};

type PageProps = {
    product?: ProductItem | null;
    service?: ServiceItem | null;
    plans: PlanItem[];
    selected_plan_id?: number | null;
    cart_id?: number | null;
    payment_methods: PaymentMethodItem[];
    billing_type_options: BillingTypeOption[];
};

type SubmitModalState = 'idle' | 'submitting' | 'success' | 'error';

const inputClass =
    'w-full rounded-[10px] border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-700 focus:ring-4 focus:ring-blue-100';

const cardClass = 'rounded-[14px] border border-slate-200 bg-white shadow-sm';

export default function Create({
    product = null,
    service = null,
    plans = [],
    selected_plan_id,
    cart_id,
    payment_methods = [],
    billing_type_options,
}: PageProps) {
    const isServiceRequest = !!service;
    const item = service ?? product;

    const itemName = item?.name ?? 'Selected Request';
    const itemDescription = item?.description ?? null;

    const isPlanProduct = !isServiceRequest && product?.pricing_type === 'plan';
    const isCustomProduct = isServiceRequest || product?.pricing_type === 'custom';

    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [submitModalState, setSubmitModalState] =
        useState<SubmitModalState>('idle');
    const [countdown, setCountdown] = useState(10);
    const [successOrderCode, setSuccessOrderCode] = useState<string | null>(null);

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            product_id: product?.id ? String(product.id) : '',
            service_id: service?.id ? String(service.id) : '',
            plan_id: selected_plan_id ? String(selected_plan_id) : '',
            cart_id: cart_id ? String(cart_id) : '',
            billing_type: isPlanProduct ? 'monthly' : 'custom',
            notes: '',
            payment_method_id: payment_methods?.[0]?.id
                ? String(payment_methods[0].id)
                : '',
            reference_number: '',
            payment_proof: null as File | null,
        });

    const selectedPlan =
        plans.find((plan) => String(plan.id) === String(data.plan_id)) ?? null;

    const selectedPaymentMethod =
        payment_methods.find(
            (method) => String(method.id) === String(data.payment_method_id),
        ) ?? null;

    const computedPriceLabel = useMemo(() => {
        if (isServiceRequest) {
            return service?.base_price_label ?? '₱0';
        }

        if (!selectedPlan) return '₱0';

        if (data.billing_type === 'yearly' && selectedPlan.price !== null) {
            return `₱${Number(selectedPlan.price * 12).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}`;
        }

        return selectedPlan.price_label;
    }, [isServiceRequest, service?.base_price_label, selectedPlan, data.billing_type]);

    const requestTypeLabel = isServiceRequest
        ? 'Custom Service Request'
        : product?.pricing_type === 'plan'
          ? 'Package-Based Product'
          : product?.pricing_type === 'custom'
            ? 'Custom Project Request'
            : 'Fixed Project Pricing';

    const disableSubmit =
        processing ||
        !item ||
        (isPlanProduct && !data.plan_id) ||
        !data.payment_method_id ||
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
                window.dispatchEvent(new Event('cart:refresh'));

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
            router.visit('/dashboard');
            return;
        }

        const timer = window.setTimeout(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        return () => window.clearTimeout(timer);
    }, [showSubmitModal, submitModalState, countdown]);

    if (!item) {
        return (
            <AppLayout fullWidth>
                <Head title="Request Not Found" />
                <div className="flex min-h-screen items-center justify-center bg-[#e8edf5] px-4">
                    <div className="max-w-md rounded-[14px] border border-slate-200 bg-white p-8 text-center shadow-sm">
                        <h1 className="text-2xl font-bold text-slate-900">
                            Request not found
                        </h1>
                        <p className="mt-2 text-sm text-slate-500">
                            Please go back to the store and select a product or service.
                        </p>
                        <Button
                            type="button"
                            onClick={() => router.visit('/dashboard')}
                            className="mt-5 rounded-[10px] bg-slate-950 px-5 py-3 text-white hover:bg-slate-800"
                        >
                            Back to Store
                        </Button>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout fullWidth>
            <Head title={`Start Request - ${itemName}`} />

            <div className="min-h-screen bg-[#e8edf5] pb-10 text-slate-900">
                <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-slate-950 via-blue-950 to-sky-900 text-white">
                    <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-sky-400/20 blur-3xl" />
                    <div className="absolute right-0 top-16 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />

                    <div className="relative mx-auto max-w-6xl px-4 py-7 md:px-6">
                        <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-100">
                                    <Sparkles className="h-3.5 w-3.5 text-sky-300" />
                                    {isServiceRequest
                                        ? 'Start Your Service Request'
                                        : 'Start Your Project'}
                                </div>

                                <h1 className="mt-4 max-w-3xl text-3xl font-black leading-tight md:text-4xl">
                                    Complete your request for {itemName}
                                </h1>

                                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-200 md:text-base">
                                    Fill out your request details, payment information, and notes.
                                    Once submitted, we’ll review your request and contact you for the next step.
                                </p>
                            </div>

                            <div className="rounded-[14px] border border-white/15 bg-white/10 p-5 backdrop-blur">
                                <div className="flex items-start gap-3">
                                    <div className="rounded-[10px] bg-white/10 p-2.5 text-emerald-300">
                                        <ShieldCheck className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">
                                            Secure request submission
                                        </p>
                                        <p className="mt-1 text-sm leading-6 text-slate-200">
                                            Submit your details safely and we’ll guide you through the next step.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
                    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
                        <div className={`${cardClass} p-6`}>
                            <div className="flex items-center gap-3">
                                <div className="rounded-[10px] bg-slate-950 p-3 text-white">
                                    <ShoppingCart className="h-5 w-5" />
                                </div>

                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">
                                        Request & Payment
                                    </h2>
                                    <p className="text-sm text-slate-500">
                                        Submit your request and payment information in one secure form.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 rounded-[14px] border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-blue-50 p-5">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700">
                                    Selected {isServiceRequest ? 'Service' : 'Solution'}
                                </p>

                                <h3 className="mt-2 text-2xl font-black text-slate-900">
                                    {itemName}
                                </h3>

                                {itemDescription && (
                                    <p className="mt-2 text-sm leading-6 text-slate-600">
                                        {itemDescription}
                                    </p>
                                )}

                                <div className="mt-4 inline-flex rounded-full border border-sky-200 bg-white px-3 py-1 text-xs font-semibold capitalize text-sky-700">
                                    {requestTypeLabel}
                                </div>
                            </div>

                            <form onSubmit={submit} className="mt-6 space-y-6">
                                {!isServiceRequest && (
                                    <div className="grid gap-5 md:grid-cols-2">
                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                                Preferred Package
                                                {isPlanProduct && (
                                                    <span className="ml-1 text-red-500">*</span>
                                                )}
                                            </label>

                                            <select
                                                value={data.plan_id}
                                                onChange={(e) => setData('plan_id', e.target.value)}
                                                className={inputClass}
                                            >
                                                <option value="">Choose a package</option>
                                                {plans.map((plan) => (
                                                    <option key={plan.id} value={plan.id}>
                                                        {plan.name} — {plan.price_label}
                                                    </option>
                                                ))}
                                            </select>

                                            {errors.plan_id && (
                                                <p className="mt-2 text-sm text-red-600">
                                                    {errors.plan_id}
                                                </p>
                                            )}
                                        </div>

                                        {isPlanProduct && (
                                            <div>
                                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                                    Payment Schedule <span className="text-red-500">*</span>
                                                </label>

                                                <select
                                                    value={data.billing_type}
                                                    onChange={(e) => setData('billing_type', e.target.value)}
                                                    className={inputClass}
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
                                        )}
                                    </div>
                                )}

                                {isCustomProduct && (
                                    <div className="rounded-[14px] border border-sky-100 bg-sky-50 p-4">
                                        <p className="text-sm font-semibold text-sky-800">
                                            {isServiceRequest
                                                ? 'Custom Service Pricing'
                                                : 'Custom Project Pricing'}
                                        </p>
                                        <p className="mt-1 text-sm leading-6 text-slate-600">
                                            Pricing will be reviewed based on your selected features, timeline,
                                            setup, and support needs.
                                        </p>
                                    </div>
                                )}

                                <div className="rounded-[14px] border border-slate-200 bg-slate-50 p-5">
                                    <div className="flex items-center gap-2">
                                        <Wallet className="h-5 w-5 text-blue-700" />
                                        <h3 className="text-lg font-bold text-slate-900">
                                            Payment Information
                                        </h3>
                                    </div>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Send your payment using your chosen method, then provide the reference number with your request.
                                    </p>

                                    <div className="mt-4 rounded-[14px] border border-blue-100 bg-blue-50 p-4">
                                        <p className="text-sm font-bold text-blue-900">
                                            How to pay
                                        </p>

                                        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-700">
                                            <li>
                                                Open your payment app such as GCash, Maya, or your selected payment method.
                                            </li>
                                            <li>
                                                Scan the QR code below, or send the payment directly to the displayed account number.
                                            </li>
                                            <li>
                                                Send the exact amount shown in the request summary.
                                            </li>
                                            <li>
                                                Copy the correct reference number from your payment receipt.
                                            </li>
                                            <li>
                                                Upload a screenshot or receipt as payment proof, then submit your request.
                                            </li>
                                        </ol>
                                    </div>

                                    <div className="mt-4 rounded-[14px] border border-red-200 bg-red-50 p-4">
                                        <div className="flex gap-3">
                                            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                                            <div>
                                                <p className="text-sm font-bold text-red-700">
                                                    Important payment reminder
                                                </p>
                                                <p className="mt-1 text-sm leading-6 text-red-700">
                                                    Please make sure the amount sent is correct. Incorrect or incomplete payment amount may be automatically rejected during verification.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                <div className="mt-4 overflow-hidden rounded-[14px] border border-dashed border-sky-200 bg-white">
                                        {selectedPaymentMethod?.image_path ? (
                                            <div className="text-center">
                                                {/* IMAGE – FULL WIDTH / NO PADDING */}
                                                <div className="w-full pt-10 rounded-[10px] bg-white overflow-hidden">
                                                    <img
                                                        src={selectedPaymentMethod.image_path}
                                                        alt={selectedPaymentMethod.name}
                                                        className="h-[320px] w-full object-contain"
                                                    />
                                                </div>

                                                {/* CONTENT */}
                                                <div className="px-6 py-5">
                                                    <p className="text-base font-bold text-slate-900">
                                                        {selectedPaymentMethod.name}
                                                    </p>

                                                    {selectedPaymentMethod.account_name && (
                                                        <p className="mt-2 text-sm text-slate-600">
                                                            Account Name:{' '}
                                                            <span className="font-bold text-blue-600">
                                                                {selectedPaymentMethod.account_name}
                                                            </span>
                                                        </p>
                                                    )}

                                                    {selectedPaymentMethod.account_number && (
                                                        <p className="mt-1 text-sm text-slate-600">
                                                            Account Number:{' '}
                                                            <span className="font-bold text-blue-600">
                                                                {selectedPaymentMethod.account_number}
                                                            </span>
                                                        </p>
                                                    )}

                                                    {selectedPaymentMethod.instructions && (
                                                        <p className="mt-3 text-xs leading-5 text-slate-500">
                                                            {selectedPaymentMethod.instructions}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center p-6 text-center">
                                                <div className="rounded-[14px] bg-sky-50 p-3">
                                                    <ImageOff className="h-8 w-8 text-sky-700" />
                                                </div>
                                                <p className="mt-3 text-sm font-bold text-slate-800">
                                                    No payment QR uploaded yet
                                                </p>
                                                <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
                                                    Please contact JCM Web Solution for the payment details.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-4 grid gap-4 md:grid-cols-[0.7fr_1.3fr]">
                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                                Payment Method <span className="text-red-500">*</span>
                                            </label>

                                            <select
                                                value={data.payment_method_id}
                                                onChange={(e) => setData('payment_method_id', e.target.value)}
                                                className={inputClass}
                                            >
                                                <option value="">Choose payment method</option>
                                                {payment_methods.map((method) => (
                                                    <option key={method.id} value={method.id}>
                                                        {method.name}
                                                    </option>
                                                ))}
                                            </select>

                                            {errors.payment_method_id && (
                                                <p className="mt-2 text-sm text-red-600">
                                                    {errors.payment_method_id}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                                Payment Reference Number <span className="text-red-500">*</span>
                                            </label>

                                            <input
                                                type="text"
                                                value={data.reference_number}
                                                onChange={(e) => setData('reference_number', e.target.value)}
                                                placeholder="Example: 1234567890"
                                                className={inputClass}
                                            />

                                            <p className="mt-2 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold leading-5 text-red-700">
                                               Make sure your reference number is correct. Wrong or unmatched reference numbers may be rejected.
                                            </p>

                                            {errors.reference_number && (
                                                <p className="mt-2 text-sm text-red-600">
                                                    {errors.reference_number}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            Upload Payment Proof
                                        </label>

                                        <label className="flex cursor-pointer flex-col items-center justify-center rounded-[14px] border border-dashed border-slate-300 bg-white px-4 py-6 text-center transition hover:border-sky-300 hover:bg-sky-50/40">
                                            <UploadCloud className="h-8 w-8 text-blue-700" />
                                            <span className="mt-2 text-sm font-semibold text-slate-700">
                                                Upload screenshot or receipt
                                            </span>
                                            <span className="mt-1 text-xs text-slate-500">
                                                Upload a clear receipt showing the correct amount, date, and reference number.
                                            </span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) =>
                                                    setData('payment_proof', e.target.files?.[0] ?? null)
                                                }
                                                className="hidden"
                                            />
                                        </label>

                                        {data.payment_proof && (
                                            <p className="mt-2 text-sm font-medium text-sky-700">
                                                Selected file: {data.payment_proof.name}
                                            </p>
                                        )}

                                        {errors.payment_proof && (
                                            <p className="mt-2 text-sm text-red-600">
                                                {errors.payment_proof}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        {isServiceRequest
                                            ? 'Service Notes / Requirements'
                                            : 'Project Notes / Requirements'}
                                    </label>

                                    <textarea
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        rows={5}
                                        placeholder="Tell us about your business needs, preferred features, target launch date, or special requests..."
                                        className={inputClass}
                                    />

                                    {errors.notes && (
                                        <p className="mt-2 text-sm text-red-600">{errors.notes}</p>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-6">
                                    <Button
                                        type="submit"
                                        disabled={disableSubmit}
                                        className="rounded-[10px] bg-gradient-to-r from-sky-600 to-blue-700 px-6 py-3 font-bold text-white shadow-lg shadow-blue-500/20 hover:from-sky-700 hover:to-blue-800"
                                    >
                                        {processing ? (
                                            <>
                                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                                Submitting Request...
                                            </>
                                        ) : (
                                            <>
                                                <ShoppingCart className="mr-2 h-4 w-4" />
                                                Submit Request
                                            </>
                                        )}
                                    </Button>

                                    <p className="text-sm text-slate-500">
                                        We’ll review your details and assist you with the next step.
                                    </p>
                                </div>
                            </form>
                        </div>

                        <aside className="lg:sticky lg:top-6 lg:self-start">
                            <div className="overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm">
                                <div className="border-b border-slate-200 bg-gradient-to-br from-slate-950 via-blue-950 to-sky-800 px-6 py-5 text-white">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-[10px] bg-white/10 p-3">
                                            <Package className="h-5 w-5" />
                                        </div>

                                        <div>
                                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-100">
                                                Request Summary
                                            </p>
                                            <h3 className="mt-1 text-xl font-bold">{itemName}</h3>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="space-y-4">
                                        {!isServiceRequest && (
                                            <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-4">
                                                <p className="text-xs uppercase tracking-wide text-slate-400">
                                                    Selected Package
                                                </p>
                                                <p className="mt-1 text-lg font-bold text-slate-900">
                                                    {selectedPlan?.name || 'Choose a package first'}
                                                </p>
                                            </div>
                                        )}

                                        <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-4">
                                            <p className="text-xs uppercase tracking-wide text-slate-400">
                                                Request Type
                                            </p>
                                            <p className="mt-1 text-sm font-semibold capitalize text-slate-900">
                                                {requestTypeLabel}
                                            </p>
                                        </div>

                                        <div className="rounded-[10px] border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-blue-50 p-4">
                                            <p className="text-xs uppercase tracking-wide text-slate-400">
                                                Estimated Price
                                            </p>
                                            <p className="mt-1 text-2xl font-extrabold text-blue-700">
                                                {computedPriceLabel}
                                            </p>
                                        </div>

                                        <div className="rounded-[10px] border border-red-200 bg-red-50 p-4">
                                            <p className="text-xs font-bold uppercase tracking-wide text-red-500">
                                                Payment Reminder
                                            </p>
                                            <p className="mt-1 text-sm font-semibold text-red-700">
                                                Send exactly {computedPriceLabel}. Incorrect amount may be rejected.
                                            </p>
                                        </div>

                                        <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-4">
                                            <p className="text-xs uppercase tracking-wide text-slate-400">
                                                Payment Method
                                            </p>
                                            <p className="mt-1 text-sm font-semibold capitalize text-slate-900">
                                                {selectedPaymentMethod?.name || 'Not selected'}
                                            </p>
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
                    <div className="w-full max-w-xl rounded-[18px] border border-slate-200 bg-white p-8 shadow-2xl">
                        {submitModalState === 'submitting' && (
                            <>
                                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
                                    <LoaderCircle className="h-11 w-11 animate-spin text-blue-700" />
                                </div>

                                <div className="mt-5 text-center">
                                    <h2 className="text-2xl font-bold text-slate-900">
                                        Submitting your request
                                    </h2>
                                    <p className="mt-3 text-sm leading-7 text-slate-500">
                                        We’re saving your request and payment details. Please keep this window open until submission is complete.
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
                                        Request submitted successfully
                                    </h2>

                                    <p className="mt-3 text-sm leading-7 text-slate-500">
                                        Your request has been received. We’ll review your request and contact you once everything is ready.
                                    </p>
                                </div>

                                {successOrderCode && (
                                    <div className="mt-6 rounded-[14px] border border-slate-200 bg-slate-50 px-5 py-4">
                                        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                                            Request Reference
                                        </p>
                                        <p className="mt-1 text-lg font-bold text-slate-900">
                                            {successOrderCode}
                                        </p>
                                    </div>
                                )}

                                <div className="mt-6 rounded-[14px] bg-slate-950 px-4 py-3 text-center text-white">
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
                                        className="flex-1 rounded-[10px] bg-slate-950 px-5 py-3 text-white hover:bg-slate-800"
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
                                        Please review your details and submit your request again.
                                    </p>
                                </div>

                                <div className="mt-6">
                                    <Button
                                        type="button"
                                        onClick={closeModal}
                                        className="w-full rounded-[10px] bg-slate-950 px-5 py-3 text-white hover:bg-slate-800"
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