<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        $orders = Order::with(['user', 'product', 'plan', 'latestTransaction', 'subscription'])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('order_code', 'like', "%{$search}%")
                        ->orWhere('status', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($subQ) use ($search) {
                            $subQ->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        })
                        ->orWhereHas('product', function ($subQ) use ($search) {
                            $subQ->where('name', 'like', "%{$search}%");
                        })
                        ->orWhereHas('plan', function ($subQ) use ($search) {
                            $subQ->where('plan_name', 'like', "%{$search}%");
                        })
                        ->orWhereHas('transactions', function ($subQ) use ($search) {
                            $subQ->where('reference_number', 'like', "%{$search}%")
                                ->orWhere('payment_method', 'like', "%{$search}%")
                                ->orWhere('status', 'like', "%{$search}%");
                        });
                });
            })
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString()
            ->through(function ($order) {
                $statusLabel = match ($order->status) {
                    'paid' => 'for verification',
                    'failed' => 'failed',
                    default => $order->status,
                };

                return [
                    'id' => $order->id,
                    'order_code' => $order->order_code,
                    'user_name' => $order->user?->name,
                    'product_name' => $order->product?->name,
                    'plan_name' => $order->plan?->plan_name,
                    'amount' => $order->amount,
                    'duration_days' => $order->duration_days,
                    'status' => $order->status,
                    'status_label' => $statusLabel,
                    'ordered_at' => optional($order->ordered_at)?->format('M d, Y h:i A'),
                    'paid_at' => optional($order->paid_at)?->format('M d, Y h:i A'),
                    'verified_at' => optional($order->verified_at)?->format('M d, Y h:i A'),
                    'has_subscription' => $order->subscription ? true : false,
                    'subscription_code' => $order->subscription?->subscription_code,
                    'transaction' => $order->latestTransaction ? [
                        'id' => $order->latestTransaction->id,
                        'transaction_code' => $order->latestTransaction->transaction_code,
                        'payment_method' => $order->latestTransaction->payment_method,
                        'reference_number' => $order->latestTransaction->reference_number,
                        'amount' => $order->latestTransaction->amount,
                        'status' => $order->latestTransaction->status,
                        'paid_at' => optional($order->latestTransaction->paid_at)?->format('M d, Y h:i A'),
                        'verified_at' => optional($order->latestTransaction->verified_at)?->format('M d, Y h:i A'),
                        'notes' => $order->latestTransaction->notes,
                    ] : null,
                ];
            });

        return Inertia::render('orders/index', [
            'filters' => [
                'search' => $search,
            ],
            'orders' => $orders,
            'plans' => Plan::with('product')
                ->where('status', 'active')
                ->orderBy('plan_name')
                ->get()
                ->map(fn ($plan) => [
                    'id' => $plan->id,
                    'product_id' => $plan->product_id,
                    'product_name' => $plan->product?->name,
                    'plan_name' => $plan->plan_name,
                    'price' => $plan->price,
                    'duration_days' => $plan->duration_days,
                    'label' => ($plan->product?->name ?? 'Unknown Product') . ' - ' . $plan->plan_name,
                ]),
            'users' => User::orderBy('name')
                ->get(['id', 'name', 'email'])
                ->map(fn ($user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'label' => $user->name . ' (' . $user->email . ')',
                ]),
            'stats' => [
                'total_orders' => Order::count(),
                'pending_orders' => Order::where('status', 'pending')->count(),
                'for_verification_orders' => Order::where('status', 'paid')->count(),
                'verified_orders' => Order::where('status', 'verified')->count(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'plan_id' => ['required', 'exists:plans,id'],
            'notes' => ['nullable', 'string'],
        ]);

        $plan = Plan::with('product')->findOrFail($validated['plan_id']);

        Order::create([
            'order_code' => $this->generateOrderCode(),
            'user_id' => $validated['user_id'],
            'product_id' => $plan->product_id,
            'plan_id' => $plan->id,
            'amount' => $plan->price,
            'duration_days' => $plan->duration_days,
            'status' => 'pending',
            'ordered_at' => now(),
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()
            ->route('admin.orders.index')
            ->with('success', 'Order created successfully.');
    }

    public function submitPayment(Request $request, Order $order): RedirectResponse
    {
        $validated = $request->validate([
            'payment_method' => ['required', 'in:gcash,maya,bank_transfer,cash,other'],
            'reference_number' => ['required', 'string', 'max:150'],
            'account_name' => ['nullable', 'string', 'max:255'],
            'account_number' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($validated, $order) {
            Transaction::create([
                'transaction_code' => $this->generateTransactionCode(),
                'order_id' => $order->id,
                'user_id' => $order->user_id,
                'payment_method' => $validated['payment_method'],
                'reference_number' => $validated['reference_number'],
                'account_name' => $validated['account_name'] ?? null,
                'account_number' => $validated['account_number'] ?? null,
                'amount' => $order->amount,
                'status' => 'submitted',
                'paid_at' => now(),
                'notes' => $validated['notes'] ?? null,
            ]);

            $order->update([
                'status' => 'paid',
                'paid_at' => now(),
            ]);
        });

        return redirect()
            ->route('admin.orders.index')
            ->with('success', 'Payment details submitted. Order is now for verification.');
    }

    public function verify(Order $order): RedirectResponse
    {
        DB::transaction(function () use ($order) {
            $transaction = $order->latestTransaction;

            if ($transaction) {
                $transaction->update([
                    'status' => 'verified',
                    'verified_at' => now(),
                ]);
            }

            $order->update([
                'status' => 'verified',
                'verified_at' => now(),
            ]);

            $existingSubscription = Subscription::where('order_id', $order->id)->first();

            if (!$existingSubscription) {
                $startDate = now()->toDateString();
                $endDate = now()->addDays((int) $order->duration_days)->toDateString();

                Subscription::create([
                    'user_id' => $order->user_id,
                    'product_id' => $order->product_id,
                    'order_id' => $order->id,
                    'plan_id' => $order->plan_id,
                    'subscription_code' => $this->generateSubscriptionCode(),
                    'subscription_type' => $this->resolveSubscriptionType((int) $order->duration_days),
                    'status' => 'active',
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'duration_days' => $order->duration_days,
                    'amount' => $order->amount,
                    'notes' => 'Auto-created from verified order: ' . $order->order_code,
                ]);
            }
        });

        return redirect()
            ->route('admin.orders.index')
            ->with('success', 'Order verified successfully and subscription created.');
    }

    public function reject(Request $request, Order $order): RedirectResponse
    {
        $validated = $request->validate([
            'notes' => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($validated, $order) {
            $transaction = $order->latestTransaction;

            if ($transaction) {
                $transaction->update([
                    'status' => 'rejected',
                    'notes' => $validated['notes'] ?? $transaction->notes,
                ]);
            }

            $order->update([
                'status' => 'failed',
                'notes' => $validated['notes'] ?? $order->notes,
            ]);
        });

        return redirect()
            ->route('admin.orders.index')
            ->with('success', 'Order marked as failed.');
    }

    public function destroy(Order $order): RedirectResponse
    {
        $hasVerifiedSubscription = Subscription::where('order_id', $order->id)->exists();

        if ($hasVerifiedSubscription) {
            return redirect()
                ->route('admin.orders.index')
                ->with('success', 'Order cannot be deleted because it already has a subscription.');
        }

        $order->delete();

        return redirect()
            ->route('admin.orders.index')
            ->with('success', 'Order deleted successfully.');
    }

    private function generateOrderCode(): string
    {
        do {
            $code = 'ORD-' . strtoupper(Str::random(6));
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

    private function generateSubscriptionCode(): string
    {
        do {
            $code = 'SUB-' . strtoupper(Str::random(6));
        } while (Subscription::where('subscription_code', $code)->exists());

        return $code;
    }

    private function resolveSubscriptionType(int $durationDays): string
    {
        return match (true) {
            $durationDays >= 365 => 'yearly',
            $durationDays >= 28 && $durationDays <= 31 => 'monthly',
            default => 'custom',
        };
    }
}