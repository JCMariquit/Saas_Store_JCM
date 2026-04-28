<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Plan;
use App\Models\Product;
use App\Models\Service;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function create(Request $request)
    {
        $productId = $request->integer('product_id');
        $serviceId = $request->integer('service_id');
        $planId = $request->integer('plan_id');
        $cartId = $request->integer('cart_id');

        abort_if(!$productId && !$serviceId, 404, 'Product or service not found.');

        $product = null;
        $service = null;
        $plans = collect();
        $selectedPlan = null;

        if ($productId) {
            $product = Product::with([
                'plans' => function ($query) {
                    $query->where('status', 'active')->orderBy('price');
                },
            ])->findOrFail($productId);

            $plans = $product->plans->map(function ($plan) {
                return [
                    'id' => $plan->id,
                    'name' => $plan->name,
                    'description' => $plan->description,
                    'price' => $plan->price,
                    'price_label' => $plan->price !== null
                        ? '₱' . number_format((float) $plan->price, 2)
                        : 'Custom',
                    'billing_cycle' => $plan->billing_cycle,
                    'duration_days' => $plan->duration_days ?? null,
                    'status' => $plan->status,
                ];
            })->values();

            $selectedPlan = $planId
                ? $product->plans->firstWhere('id', $planId)
                : null;
        }

        if ($serviceId) {
            $service = Service::query()
                ->where('status', 'active')
                ->findOrFail($serviceId);
        }

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

            'payment_methods' => [
                ['value' => 'gcash', 'label' => 'GCash'],
                ['value' => 'maya', 'label' => 'Maya'],
            ],

            'billing_type_options' => [
                ['value' => 'monthly', 'label' => 'Monthly'],
                ['value' => 'yearly', 'label' => 'Yearly'],
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => ['nullable', 'integer', 'exists:products,id'],
            'service_id' => ['nullable', 'integer', 'exists:services,id'],
            'plan_id' => ['nullable', 'integer', 'exists:plans,id'],
            'cart_id' => ['nullable', 'integer', 'exists:carts,id'],
            'billing_type' => ['nullable', 'in:monthly,yearly,custom'],
            'notes' => ['nullable', 'string'],

            'payment_method' => ['required', 'in:gcash,maya'],
            'reference_number' => ['required', 'string', 'max:100'],
            'payment_proof' => ['nullable', 'image', 'max:5120'],
        ]);

        if (empty($validated['product_id']) && empty($validated['service_id'])) {
            return back()->withErrors([
                'product_id' => 'Please select a product or service.',
            ])->withInput();
        }

        if (!empty($validated['product_id']) && !empty($validated['service_id'])) {
            return back()->withErrors([
                'product_id' => 'Please select only one item.',
            ])->withInput();
        }

        $product = null;
        $service = null;
        $plan = null;

        if (!empty($validated['product_id'])) {
            $product = Product::findOrFail($validated['product_id']);

            if ($product->pricing_type === 'plan' && empty($validated['plan_id'])) {
                return back()->withErrors([
                    'plan_id' => 'Please select a plan.',
                ])->withInput();
            }

            if (!empty($validated['plan_id'])) {
                $plan = Plan::where('id', $validated['plan_id'])
                    ->where('product_id', $product->id)
                    ->where('status', 'active')
                    ->firstOrFail();
            }
        }

        if (!empty($validated['service_id'])) {
            $service = Service::query()
                ->where('status', 'active')
                ->findOrFail($validated['service_id']);
        }

        if ($service) {
            $billingType = 'custom';
            $amount = (float) ($service->base_price ?? 0);
            $durationDays = null;
            $plan = null;
        } else {
            $billingType = $product && $product->pricing_type === 'plan'
                ? ($validated['billing_type'] ?? 'monthly')
                : 'custom';

            $amount = (float) ($plan?->price ?? 0);

            if ($billingType === 'yearly' && $amount > 0) {
                $amount *= 12;
            }

            $durationDays = match ($billingType) {
                'monthly' => 30,
                'yearly' => 365,
                default => $plan?->duration_days,
            };
        }

        $paymentProofPath = null;

        if ($request->hasFile('payment_proof')) {
            $paymentProofPath = $request->file('payment_proof')->store('payment-proofs', 'public');
        }

        $order = null;

        DB::transaction(function () use (
            $product,
            $service,
            $plan,
            $billingType,
            $amount,
            $durationDays,
            $validated,
            $paymentProofPath,
            &$order
        ) {
            $order = Order::create([
                'order_code' => $this->generateOrderCode(),
                'user_id' => Auth::id(),

                // Product order only
                'product_id' => $product?->id,
                'plan_id' => $product ? $plan?->id : null,

                // Service/custom build order only
                'service_id' => $service?->id,

                'billing_type' => $billingType,
                'amount' => $amount,
                'duration_days' => $durationDays,
                'status' => 'pending',
                'ordered_at' => now(),
                'notes' => $validated['notes'] ?? null,
            ]);

            Transaction::create([
                'transaction_code' => $this->generateTransactionCode(),
                'order_id' => $order->id,
                'user_id' => Auth::id(),
                'payment_method' => $validated['payment_method'],
                'reference_number' => $validated['reference_number'],
                'amount' => $amount,
                'payment_proof' => $paymentProofPath,
                'status' => 'pending',
                'paid_at' => now(),
                'notes' => 'Payment submitted together with order.',
            ]);

            if (!empty($validated['cart_id'])) {
                DB::table('carts')
                    ->where('id', $validated['cart_id'])
                    ->where('user_id', Auth::id())
                    ->delete();
            }
        });

        $redirectParams = $service
            ? ['service_id' => $service->id]
            : [
                'product_id' => $product?->id,
                'plan_id' => $plan?->id,
            ];

        return redirect()->route('orders.create', $redirectParams)->with([
            'order_success' => true,
            'success_title' => 'Request submitted successfully',
            'success_message' => 'Your request has been submitted successfully.',
            'redirect_to' => route('dashboard'),
            'redirect_after' => 5,
            'order_code' => $order?->order_code,
        ]);
    }

    private function generateOrderCode(): string
    {
        do {
            $code = 'ORD-' . now()->format('Ymd') . '-' . strtoupper(Str::random(6));
        } while (Order::where('order_code', $code)->exists());

        return $code;
    }

    private function generateTransactionCode(): string
    {
        do {
            $code = 'TXN-' . strtoupper(Str::random(6));
        } while (Transaction::where('transaction_code', $code)->exists());

        return $code;
    }
}