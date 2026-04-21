<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Plan;
use App\Models\Product;
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
        $planId = $request->integer('plan_id');

        abort_if(!$productId, 404, 'Product not found.');

        $product = Product::with([
            'plans' => function ($query) {
                $query->where('status', 'active')->orderBy('price');
            }
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

        return Inertia::render('orders/create', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'description' => $product->description,
                'pricing_type' => $product->pricing_type,
            ],
            'plans' => $plans,
            'selected_plan_id' => $selectedPlan?->id,
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
            'product_id' => ['required', 'exists:products,id'],
            'plan_id' => ['nullable', 'exists:plans,id'],
            'billing_type' => ['nullable', 'in:monthly,yearly,custom'],
            'notes' => ['nullable', 'string'],

            'payment_method' => ['required', 'in:gcash,maya'],
            'reference_number' => ['required', 'string', 'max:100'],
            'payment_proof' => ['nullable', 'image', 'max:5120'],
        ]);

        $product = Product::findOrFail($validated['product_id']);

        if ($product->pricing_type === 'plan' && empty($validated['plan_id'])) {
            return back()->withErrors([
                'plan_id' => 'Please select a plan.',
            ])->withInput();
        }

        $plan = null;

        if (!empty($validated['plan_id'])) {
            $plan = Plan::where('id', $validated['plan_id'])
                ->where('product_id', $product->id)
                ->where('status', 'active')
                ->firstOrFail();
        }

        if ($product->pricing_type === 'plan') {
            $billingType = $validated['billing_type'] ?? 'monthly';
        } else {
            $billingType = 'custom';
        }

        $amount = $plan?->price ?? 0;
        $durationDays = match ($billingType) {
            'monthly' => 30,
            'yearly' => 365,
            default => $plan?->duration_days,
        };

        $paymentProofPath = null;

        if ($request->hasFile('payment_proof')) {
            $paymentProofPath = $request->file('payment_proof')->store('payment-proofs', 'public');
        }

        DB::transaction(function () use (
            $product,
            $plan,
            $billingType,
            $amount,
            $durationDays,
            $validated,
            $paymentProofPath
        ) {
            $order = Order::create([
                'order_code' => $this->generateOrderCode(),
                'user_id' => Auth::id(),
                'product_id' => $product->id,
                'plan_id' => $plan?->id,
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
        });

        return redirect()
            ->route('dashboard')
            ->with('success', 'Your order has been submitted successfully. Redirecting...');
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