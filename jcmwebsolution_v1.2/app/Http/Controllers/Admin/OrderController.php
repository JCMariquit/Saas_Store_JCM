<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\PaymentMethod;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Transaction;
use App\Models\User;
use App\Services\PaymentVerificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        $orders = Order::query()
            ->with([
                'user:id,name,email',
                'accountOwner:id,name,email',
                'product:id,name,product_code',
                'plan:id,product_id,plan_name,price,billing_interval,duration_days,currency',
                'latestTransaction.paymentMethod:id,name,slug',
                'subscription:id,subscription_code,status',
            ])
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($nested) use ($search): void {
                    $nested->where('order_code', 'like', "%{$search}%")
                        ->orWhere('status', 'like', "%{$search}%")
                        ->orWhere('billing_type', 'like', "%{$search}%")
                        ->orWhereHas('accountOwner', function ($userQuery) use ($search): void {
                            $userQuery->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        })
                        ->orWhereHas('product', fn ($productQuery) => $productQuery->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('plan', fn ($planQuery) => $planQuery->where('plan_name', 'like', "%{$search}%"))
                        ->orWhereHas('transactions', function ($transactionQuery) use ($search): void {
                            $transactionQuery->where('transaction_code', 'like', "%{$search}%")
                                ->orWhere('reference_number', 'like', "%{$search}%")
                                ->orWhere('status', 'like', "%{$search}%")
                                ->orWhereHas('paymentMethod', function ($paymentQuery) use ($search): void {
                                    $paymentQuery->where('name', 'like', "%{$search}%")
                                        ->orWhere('slug', 'like', "%{$search}%");
                                });
                        });
                });
            })
            ->latest('id')
            ->paginate(10)
            ->withQueryString()
            ->through(function (Order $order): array {
                $transaction = $order->latestTransaction;

                return [
                    'id' => $order->id,
                    'order_code' => $order->order_code,
                    'user_name' => $order->accountOwner?->name ?? $order->user?->name,
                    'product_name' => $order->product?->name,
                    'plan_name' => $order->plan?->plan_name,
                    'billing_type' => $order->billing_type,
                    'order_type' => $order->order_type,
                    'amount' => (float) $order->amount,
                    'duration_days' => (int) ($order->duration_days ?? 0),
                    'status' => $order->status,
                    'status_label' => str($order->status)->replace('_', ' ')->title()->toString(),
                    'ordered_at' => $order->ordered_at?->format('M d, Y h:i A'),
                    'paid_at' => $order->paid_at?->format('M d, Y h:i A'),
                    'verified_at' => $order->verified_at?->format('M d, Y h:i A'),
                    'has_subscription' => $order->subscription !== null,
                    'subscription_code' => $order->subscription?->subscription_code,
                    'has_transaction' => $transaction !== null,
                    'transaction' => $transaction ? [
                        'id' => $transaction->id,
                        'transaction_code' => $transaction->transaction_code,
                        'payment_method' => $transaction->paymentMethod?->name,
                        'reference_number' => $transaction->reference_number,
                        'amount' => (float) $transaction->amount,
                        'status' => $transaction->status,
                        'paid_at' => $transaction->paid_at?->format('M d, Y h:i A'),
                        'verified_at' => $transaction->verified_at?->format('M d, Y h:i A'),
                        'notes' => $transaction->notes,
                    ] : null,
                ];
            });

        $plans = Plan::query()
            ->with('product:id,name')
            ->where('status', 'active')
            ->orderBy('product_id')
            ->orderBy('sort_order')
            ->get()
            ->map(fn (Plan $plan): array => [
                'id' => $plan->id,
                'product_id' => $plan->product_id,
                'product_name' => $plan->product?->name,
                'plan_name' => $plan->plan_name,
                'price' => (float) $plan->price,
                'duration_days' => (int) $plan->duration_days,
                'billing_interval' => $plan->billing_interval,
                'label' => ($plan->product?->name ?? 'Unknown Product').' - '.$plan->plan_name,
            ]);

        $users = User::query()
            ->where('is_active', true)
            ->whereDoesntHave('platformRoles', function ($query): void {
                $query->where('user_platform_roles.status', 'active')
                    ->where('platform_roles.status', 'active')
                    ->whereIn('platform_roles.role_code', ['super_admin', 'admin']);
            })
            ->orderBy('name')
            ->get(['id', 'name', 'email'])
            ->map(fn (User $user): array => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'label' => $user->name.' ('.$user->email.')',
            ]);

        $paymentMethods = PaymentMethod::query()
            ->where('status', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'account_name', 'account_number'])
            ->map(fn (PaymentMethod $method): array => [
                'id' => $method->id,
                'name' => $method->name,
                'slug' => $method->slug,
                'account_name' => $method->account_name,
                'account_number' => $method->account_number,
            ]);

        return Inertia::render('admin/orders/index', [
            'filters' => ['search' => $search],
            'orders' => $orders,
            'plans' => $plans,
            'users' => $users,
            'paymentMethods' => $paymentMethods,
            'stats' => [
                'total_orders' => Order::count(),
                'pending_orders' => Order::where('status', 'pending')->count(),
                'for_verification_orders' => Order::whereIn('status', ['payment_submitted', 'paid'])->count(),
                'verified_orders' => Order::where('status', 'verified')->count(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'plan_id' => ['required', 'integer', 'exists:plans,id'],
            'billing_type' => ['required', Rule::in(['trial', 'monthly', 'quarterly', 'yearly', 'custom'])],
            'duration_days_override' => ['nullable', 'integer', 'min:1', 'max:3650'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $plan = Plan::query()->with('product')->where('status', 'active')->findOrFail($validated['plan_id']);
        [$amount, $durationDays, $planPriceId] = $this->resolveOrderTerms(
            $plan,
            $validated['billing_type'],
            isset($validated['duration_days_override']) ? (int) $validated['duration_days_override'] : null,
        );

        Order::create([
            'order_code' => $this->generateOrderCode(),
            'user_id' => $validated['user_id'],
            'account_owner_id' => $validated['user_id'],
            'product_id' => $plan->product_id,
            'plan_id' => $plan->id,
            'plan_price_id' => $planPriceId,
            'billing_type' => $validated['billing_type'],
            'order_type' => 'new_subscription',
            'amount' => $amount,
            'currency' => $plan->currency ?: 'PHP',
            'duration_days' => $durationDays,
            'status' => 'pending',
            'ordered_at' => now(),
            'notes' => $validated['notes'] ?? null,
        ]);

        return back()->with('success', 'Order created successfully.');
    }

    public function submitPayment(Request $request, Order $order): RedirectResponse
    {
        if ($order->status === 'verified') {
            return back()->with('success', 'This order is already verified.');
        }

        if ($order->latestTransaction()->whereIn('status', ['pending', 'submitted', 'verified'])->exists()) {
            return back()->with('success', 'This order already has an active payment record.');
        }

        $validated = $request->validate([
            'payment_method_id' => [
                'required',
                'integer',
                Rule::exists('payment_methods', 'id')->where('status', 1),
            ],
            'reference_number' => ['required', 'string', 'max:150'],
            'account_name' => ['nullable', 'string', 'max:255'],
            'account_number' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        DB::transaction(function () use ($order, $validated): void {
            Transaction::create([
                'transaction_code' => $this->generateTransactionCode(),
                'order_id' => $order->id,
                'user_id' => $order->user_id,
                'payment_method_id' => $validated['payment_method_id'],
                'reference_number' => $validated['reference_number'],
                'account_name' => $validated['account_name'] ?? null,
                'account_number' => $validated['account_number'] ?? null,
                'amount' => $order->amount,
                'status' => 'submitted',
                'submitted_at' => now(),
                'paid_at' => now(),
                'notes' => $validated['notes'] ?? null,
            ]);

            $order->update([
                'status' => 'payment_submitted',
                'paid_at' => now(),
            ]);
        });

        return back()->with('success', 'Payment details submitted successfully.');
    }

    public function verify(
        Request $request,
        Order $order,
        PaymentVerificationService $service,
    ): RedirectResponse {
        $validated = $request->validate([
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $service->approveOrder(
            $request,
            $order,
            $order->latestTransaction()->first(),
            $validated['notes'] ?? null,
        );

        return back()->with(
            'success',
            'Order verified and subscription synchronized successfully.',
        );
    }

    public function reject(
        Request $request,
        Order $order,
        PaymentVerificationService $service,
    ): RedirectResponse {
        $validated = $request->validate([
            'notes' => ['required', 'string', 'min:5', 'max:2000'],
        ]);

        $transaction = $order->latestTransaction()->first();

        if ($transaction === null) {
            return back()->withErrors([
                'notes' => 'A payment transaction is required before this order can be rejected.',
            ]);
        }

        $service->rejectTransaction(
            $request,
            $transaction,
            $validated['notes'],
        );

        return back()->with('success', 'Order payment rejected successfully.');
    }

    public function destroy(Order $order): RedirectResponse
    {
        if ($order->subscription_id || $order->status === 'verified') {
            return back()->with('success', 'Verified orders are retained for subscription audit history.');
        }

        DB::transaction(function () use ($order): void {
            $order->transactions()->delete();
            $order->delete();
        });

        return back()->with('success', 'Order deleted successfully.');
    }

    private function resolveOrderTerms(Plan $plan, string $billingType, ?int $overrideDays): array
    {
        if ($billingType === 'trial') {
            return [0.0, max(1, $overrideDays ?? $plan->trial_days ?: 7), null];
        }

        $priceRow = DB::table('plan_prices')
            ->where('plan_id', $plan->id)
            ->where('billing_interval', $billingType)
            ->where('status', 'active')
            ->first();

        if ($priceRow) {
            return [(float) $priceRow->price, max(1, $overrideDays ?? (int) $priceRow->duration_days), (int) $priceRow->id];
        }

        $duration = $overrideDays ?? match ($billingType) {
            'quarterly' => 90,
            'yearly' => 365,
            default => max(1, (int) $plan->duration_days),
        };

        $amount = match ($billingType) {
            'quarterly' => (float) $plan->price * 3,
            'yearly' => (float) $plan->price * 12,
            default => (float) $plan->price,
        };

        return [$amount, $duration, null];
    }

    private function syncOwnerProductAccess(Subscription $subscription, ?int $actorId): void
    {
        $ownerProductUserTypeId = DB::table('product_user_types')
            ->join('user_types', 'user_types.id', '=', 'product_user_types.user_type_id')
            ->where('product_user_types.product_id', $subscription->product_id)
            ->where('product_user_types.status', 'active')
            ->where('user_types.type_code', 'owner')
            ->value('product_user_types.id');

        if (! $ownerProductUserTypeId) {
            return;
        }

        $lookup = [
            'user_id' => $subscription->account_owner_id,
            'product_id' => $subscription->product_id,
            'account_owner_id' => $subscription->account_owner_id,
        ];

        $values = [
            'product_user_type_id' => $ownerProductUserTypeId,
            'subscription_id' => $subscription->id,
            'status' => 'active',
            'assigned_by' => $actorId,
            'joined_at' => now(),
            'updated_at' => now(),
        ];

        $existingId = DB::table('user_product_access')->where($lookup)->value('id');

        if ($existingId) {
            DB::table('user_product_access')->where('id', $existingId)->update($values);
        } else {
            DB::table('user_product_access')->insert($lookup + $values + [
                'created_at' => now(),
            ]);
        }
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

    private function generateSubscriptionCode(): string
    {
        do {
            $code = 'SUB-'.strtoupper(Str::random(8));
        } while (Subscription::where('subscription_code', $code)->exists());

        return $code;
    }
}
