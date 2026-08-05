<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\PaymentMethod;
use App\Models\Plan;
use App\Models\Product;
use App\Models\Service;
use App\Models\Transaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(): RedirectResponse
    {
        return redirect()->route('dashboard');
    }

    public function create(Request $request): Response
    {
        $productId = $request->integer('product_id');
        $serviceId = $request->integer('service_id');
        $planId = $request->integer('plan_id');
        $cartId = $request->integer('cart_id');

        abort_if(! $productId && ! $serviceId, 404, 'Product or service not found.');

        $product = null;
        $service = null;
        $plans = collect();
        $selectedPlan = null;

        if ($productId) {
            $product = Product::query()
                ->with(['plans' => fn ($query) => $query->where('status', 'active')->orderBy('sort_order')->orderBy('price')])
                ->whereIn('status', ['active', 'development'])
                ->findOrFail($productId);

            $plans = $product->plans->map(fn (Plan $plan): array => [
                'id' => $plan->id,
                'name' => $plan->plan_name,
                'description' => $plan->description,
                'price' => (float) $plan->price,
                'price_label' => '₱'.number_format((float) $plan->price, 2),
                'billing_cycle' => $plan->billing_interval,
                'duration_days' => (int) $plan->duration_days,
                'status' => $plan->status,
            ])->values();

            $selectedPlan = $planId ? $product->plans->firstWhere('id', $planId) : null;
        }

        if ($serviceId) {
            $service = Service::query()->where('status', 'active')->findOrFail($serviceId);
        }

        $paymentMethods = PaymentMethod::query()
            ->where('status', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn (PaymentMethod $method): array => [
                'id' => $method->id,
                'name' => $method->name,
                'slug' => $method->slug,
                'account_name' => $method->account_name,
                'account_number' => $method->account_number,
                'account_owner' => $method->account_owner,
                'image_path' => $this->mediaUrl($method->image_path),
                'instructions' => $method->instructions,
            ])->values();

        return Inertia::render('orders/create', [
            'product' => $product ? [
                'id' => $product->id,
                'name' => $product->name,
                'description' => $product->description,
                'pricing_type' => $product->pricing_type,
            ] : null,
            'service' => $service ? [
                'id' => $service->id,
                'name' => $service->name,
                'description' => $service->description,
                'service_type' => $service->service_type,
                'pricing_type' => $service->pricing_type,
                'base_price' => $service->base_price,
                'base_price_label' => $service->base_price_label,
            ] : null,
            'plans' => $plans,
            'selected_plan_id' => $selectedPlan?->id,
            'cart_id' => $cartId ?: null,
            'payment_methods' => $paymentMethods,
            'billing_type_options' => [
                ['value' => 'monthly', 'label' => 'Monthly'],
                ['value' => 'quarterly', 'label' => 'Quarterly'],
                ['value' => 'yearly', 'label' => 'Yearly'],
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => ['nullable', 'integer', 'exists:products,id'],
            'service_id' => ['nullable', 'integer', 'exists:services,id'],
            'plan_id' => ['nullable', 'integer', 'exists:plans,id'],
            'cart_id' => ['nullable', 'integer', 'exists:carts,id'],
            'billing_type' => ['nullable', Rule::in(['monthly', 'quarterly', 'yearly', 'custom'])],
            'notes' => ['nullable', 'string', 'max:2000'],
            'payment_method_id' => ['required', 'integer', Rule::exists('payment_methods', 'id')->where('status', 1)],
            'reference_number' => ['required', 'string', 'max:150'],
            'payment_proof' => ['nullable', 'image', 'max:5120'],
        ]);

        if (empty($validated['product_id']) === empty($validated['service_id'])) {
            return back()->withErrors(['product_id' => 'Please select exactly one product or service.'])->withInput();
        }

        $paymentMethod = PaymentMethod::query()->where('status', true)->findOrFail($validated['payment_method_id']);
        $product = null;
        $service = null;
        $plan = null;
        $planPriceId = null;

        if (! empty($validated['product_id'])) {
            $product = Product::query()->whereIn('status', ['active', 'development'])->findOrFail($validated['product_id']);

            if ($product->pricing_type === 'plan' && empty($validated['plan_id'])) {
                return back()->withErrors(['plan_id' => 'Please select a plan.'])->withInput();
            }

            if (! empty($validated['plan_id'])) {
                $plan = Plan::query()
                    ->whereKey($validated['plan_id'])
                    ->where('product_id', $product->id)
                    ->where('status', 'active')
                    ->firstOrFail();
            }
        } else {
            $service = Service::query()->where('status', 'active')->findOrFail($validated['service_id']);
        }

        if ($service) {
            $billingType = 'custom';
            $amount = (float) ($service->base_price ?? 0);
            $durationDays = null;
        } else {
            $billingType = $product?->pricing_type === 'plan' ? ($validated['billing_type'] ?? $plan?->billing_interval ?? 'monthly') : 'custom';
            $priceRow = $plan ? DB::table('plan_prices')
                ->where('plan_id', $plan->id)
                ->where('billing_interval', $billingType)
                ->where('status', 'active')
                ->first() : null;

            $planPriceId = $priceRow?->id;
            $amount = $priceRow ? (float) $priceRow->price : (float) ($plan?->price ?? $product?->price ?? 0);
            $durationDays = $priceRow ? (int) $priceRow->duration_days : match ($billingType) {
                'quarterly' => 90,
                'yearly' => 365,
                default => (int) ($plan?->duration_days ?? 30),
            };
        }

        $paymentProofPath = $request->hasFile('payment_proof')
            ? $request->file('payment_proof')->store('payment-proofs', 'public')
            : null;

        $order = null;
        $transaction = null;

        DB::transaction(function () use (
            $product,
            $service,
            $plan,
            $planPriceId,
            $billingType,
            $amount,
            $durationDays,
            $validated,
            $paymentProofPath,
            $paymentMethod,
            &$order,
            &$transaction,
        ): void {
            $order = Order::create([
                'order_code' => $this->generateOrderCode(),
                'user_id' => Auth::id(),
                'account_owner_id' => Auth::id(),
                'product_id' => $product?->id,
                'service_id' => $service?->id,
                'plan_id' => $product ? $plan?->id : null,
                'plan_price_id' => $planPriceId,
                'billing_type' => $billingType,
                'order_type' => $service ? 'custom_service' : 'new_subscription',
                'amount' => $amount,
                'currency' => $plan?->currency ?? $service?->currency ?? 'PHP',
                'duration_days' => $durationDays,
                'status' => 'payment_submitted',
                'ordered_at' => now(),
                'paid_at' => now(),
                'notes' => $validated['notes'] ?? null,
            ]);

            $transaction = Transaction::create([
                'transaction_code' => $this->generateTransactionCode(),
                'order_id' => $order->id,
                'user_id' => Auth::id(),
                'payment_method_id' => $paymentMethod->id,
                'reference_number' => $validated['reference_number'],
                'account_name' => $paymentMethod->account_name,
                'account_number' => $paymentMethod->account_number,
                'amount' => $amount,
                'payment_proof' => $paymentProofPath,
                'status' => 'submitted',
                'submitted_at' => now(),
                'paid_at' => now(),
                'notes' => 'Payment submitted together with order.',
            ]);

            if (! empty($validated['cart_id'])) {
                DB::table('carts')->where('id', $validated['cart_id'])->where('user_id', Auth::id())->delete();
            }
        });

        return redirect()->route('dashboard')->with([
            'order_success' => true,
            'success_title' => 'Request submitted successfully',
            'success_message' => 'Your request is waiting for payment verification.',
            'order_code' => $order?->order_code,
            'transaction_code' => $transaction?->transaction_code,
        ]);
    }

    private function mediaUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        if (Str::startsWith($path, ['http://', 'https://'])) {
            return $path;
        }

        $cleanPath = Str::after(ltrim($path, '/'), 'storage/');

        return route('media.show', ['path' => $cleanPath], false);
    }

    private function generateOrderCode(): string
    {
        do {
            $code = 'ORD-'.now()->format('Ymd').'-'.strtoupper(Str::random(6));
        } while (Order::where('order_code', $code)->exists());

        return $code;
    }

    private function generateTransactionCode(): string
    {
        do {
            $code = 'TXN-'.strtoupper(Str::random(8));
        } while (Transaction::where('transaction_code', $code)->exists());

        return $code;
    }
}
