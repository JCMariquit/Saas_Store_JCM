<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Subscription;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    private const ACTIONS = [
        'activate',
        'restore',
        'expire',
        'past_due',
        'grace_period',
        'lock',
        'suspend',
        'cancel',
        'change_plan',
    ];

    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $status = trim((string) $request->query('status', ''));
        $productId = $request->integer('product_id') ?: null;

        $subscriptions = Subscription::query()
            ->with(['user', 'accountOwner', 'product', 'plan'])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($subQuery) use ($search) {
                    $subQuery->where('subscription_code', 'like', "%{$search}%")
                        ->orWhere('status', 'like', "%{$search}%")
                        ->orWhereHas('accountOwner', fn ($ownerQuery) => $ownerQuery
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%"))
                        ->orWhereHas('product', fn ($productQuery) => $productQuery
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('product_code', 'like', "%{$search}%"))
                        ->orWhereHas('plan', fn ($planQuery) => $planQuery
                            ->where('plan_name', 'like', "%{$search}%")
                            ->orWhere('plan_code', 'like', "%{$search}%"));
                });
            })
            ->when($status !== '', fn ($query) => $query->where('status', $status))
            ->when($productId, fn ($query) => $query->where('product_id', $productId))
            ->orderByDesc('id')
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Subscription $subscription) => $this->serializeSubscription($subscription));

        $plans = Plan::query()
            ->with('product:id,name')
            ->where('status', 'active')
            ->orderBy('product_id')
            ->orderBy('sort_order')
            ->orderBy('price')
            ->get()
            ->map(fn (Plan $plan) => [
                'id' => $plan->id,
                'product_id' => $plan->product_id,
                'product_name' => $plan->product?->name,
                'plan_name' => $plan->plan_name,
                'plan_code' => $plan->plan_code,
                'price' => (float) $plan->price,
                'duration_days' => (int) $plan->duration_days,
                'billing_interval' => $plan->billing_interval,
                'currency' => $plan->currency,
            ]);

        return Inertia::render('admin/subscriptions/index', [
            'subscriptions' => $subscriptions,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'product_id' => $productId,
            ],
            'plans' => $plans,
            'products' => $plans
                ->unique('product_id')
                ->map(fn ($plan) => [
                    'id' => $plan['product_id'],
                    'name' => $plan['product_name'],
                ])
                ->values(),
            'stats' => [
                'total' => Subscription::count(),
                'full_access' => Subscription::whereIn('status', ['trial', 'active'])->count(),
                'read_only' => Subscription::whereIn('status', ['past_due', 'grace_period', 'expired'])->count(),
                'blocked' => Subscription::whereIn('status', ['cancelled', 'suspended', 'locked'])->count(),
            ],
            'statuses' => [
                'pending', 'trial', 'active', 'past_due', 'grace_period',
                'expired', 'cancelled', 'suspended', 'locked',
            ],
        ]);
    }

    public function control(Request $request, Subscription $subscription): RedirectResponse
    {
        $validated = $request->validate([
            'action' => ['required', Rule::in(self::ACTIONS)],
            'plan_id' => ['nullable', 'integer', 'exists:plans,id'],
            'duration_days' => ['nullable', 'integer', 'min:1', 'max:3650'],
            'grace_days' => ['nullable', 'integer', 'min:1', 'max:365'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        DB::transaction(function () use ($request, $subscription, $validated): void {
            $locked = Subscription::query()->lockForUpdate()->findOrFail($subscription->id);
            $oldStatus = $locked->status;
            $oldPlanId = $locked->plan_id;
            $action = $validated['action'];
            $notes = trim((string) ($validated['notes'] ?? '')) ?: null;
            $eventType = 'resumed';
            $metadata = ['admin_action' => $action];

            if ($action === 'change_plan') {
                $plan = Plan::query()
                    ->whereKey($validated['plan_id'] ?? 0)
                    ->where('product_id', $locked->product_id)
                    ->where('status', 'active')
                    ->firstOrFail();

                $eventType = (float) $plan->price >= (float) ($locked->plan?->price ?? 0)
                    ? 'upgraded'
                    : 'downgraded';

                $defaultPrice = DB::table('plan_prices')
                    ->where('plan_id', $plan->id)
                    ->where('status', 'active')
                    ->orderByDesc('is_default')
                    ->orderBy('sort_order')
                    ->first();

                $locked->fill([
                    'plan_id' => $plan->id,
                    'plan_price_id' => $defaultPrice?->id,
                    'subscription_type' => $defaultPrice?->billing_interval ?? $plan->billing_interval,
                    'duration_days' => (int) ($defaultPrice?->duration_days ?? $plan->duration_days),
                    'amount' => $defaultPrice?->price ?? $plan->price,
                    'currency' => $defaultPrice?->currency ?? $plan->currency,
                ]);
            } else {
                $durationDays = (int) ($validated['duration_days'] ?? $locked->plan?->duration_days ?? 30);
                $now = now();

                match ($action) {
                    'activate', 'restore' => $locked->fill([
                        'status' => 'active',
                        'start_date' => $locked->start_date ?? $now->toDateString(),
                        'end_date' => $now->copy()->addDays($durationDays)->toDateString(),
                        'current_period_start' => $now,
                        'current_period_end' => $now->copy()->addDays($durationDays),
                        'duration_days' => $durationDays,
                        'activated_at' => $locked->activated_at ?? $now,
                        'grace_ends_at' => null,
                        'ended_at' => null,
                        'cancelled_at' => null,
                        'cancellation_reason' => null,
                        'cancel_at_period_end' => false,
                    ]),
                    'expire' => $locked->fill([
                        'status' => 'expired',
                        'end_date' => $now->toDateString(),
                        'current_period_end' => $now,
                        'ended_at' => $now,
                    ]),
                    'past_due' => $locked->fill([
                        'status' => 'past_due',
                        'grace_ends_at' => null,
                    ]),
                    'grace_period' => $locked->fill([
                        'status' => 'grace_period',
                        'grace_ends_at' => $now->copy()->addDays((int) ($validated['grace_days'] ?? 7)),
                    ]),
                    'lock' => $locked->fill(['status' => 'locked']),
                    'suspend' => $locked->fill(['status' => 'suspended']),
                    'cancel' => $locked->fill([
                        'status' => 'cancelled',
                        'cancelled_at' => $now,
                        'cancellation_reason' => $notes,
                        'ended_at' => $now,
                    ]),
                    default => null,
                };

                $eventType = match ($action) {
                    'activate' => 'activated',
                    'restore' => 'resumed',
                    'expire' => 'expired',
                    'past_due', 'grace_period' => 'past_due',
                    'lock', 'suspend' => 'suspended',
                    'cancel' => 'cancelled',
                    default => 'resumed',
                };
            }

            if ($notes && $action !== 'cancel') {
                $locked->notes = $notes;
            }

            $locked->save();
            $this->syncProductAccess($locked);

            DB::table('subscription_events')->insert([
                'subscription_id' => $locked->id,
                'actor_user_id' => $request->user()?->getKey(),
                'event_type' => $eventType,
                'old_plan_id' => $oldPlanId,
                'new_plan_id' => $locked->plan_id,
                'old_status' => $oldStatus,
                'new_status' => $locked->status,
                'notes' => $notes,
                'metadata' => json_encode($metadata, JSON_UNESCAPED_SLASHES),
                'created_at' => now(),
            ]);
        });

        return back()->with('success', 'Subscription control action applied successfully.');
    }

    public function destroy(Subscription $subscription): RedirectResponse
    {
        if (! in_array($subscription->status, ['cancelled', 'expired'], true)) {
            return back()->with('success', 'Only cancelled or expired subscriptions can be deleted.');
        }

        $subscription->delete();

        return back()->with('success', 'Subscription deleted successfully.');
    }

    private function syncProductAccess(Subscription $subscription): void
    {
        $accessStatus = match ($subscription->status) {
            'pending' => 'pending',
            'trial', 'active', 'past_due', 'grace_period', 'expired' => 'active',
            default => 'inactive',
        };

        DB::table('user_product_access')
            ->where('account_owner_id', $subscription->account_owner_id)
            ->where('product_id', $subscription->product_id)
            ->update([
                'subscription_id' => $subscription->id,
                'status' => $accessStatus,
                'updated_at' => now(),
            ]);
    }

    private function serializeSubscription(Subscription $subscription): array
    {
        $accessMode = match ($subscription->status) {
            'trial', 'active' => 'full',
            'past_due', 'grace_period', 'expired' => 'read_only',
            default => 'blocked',
        };

        return [
            'id' => $subscription->id,
            'subscription_code' => $subscription->subscription_code,
            'user_name' => $subscription->user?->name,
            'account_owner_name' => $subscription->accountOwner?->name,
            'account_owner_email' => $subscription->accountOwner?->email,
            'product_id' => $subscription->product_id,
            'product_name' => $subscription->product?->name,
            'product_code' => $subscription->product?->product_code,
            'plan_id' => $subscription->plan_id,
            'plan_name' => $subscription->plan?->plan_name,
            'plan_code' => $subscription->plan?->plan_code,
            'subscription_type' => $subscription->subscription_type,
            'status' => $subscription->status,
            'access_mode' => $accessMode,
            'start_date' => $subscription->start_date?->format('Y-m-d'),
            'end_date' => $subscription->end_date?->format('Y-m-d'),
            'current_period_end' => $subscription->current_period_end?->toIso8601String(),
            'grace_ends_at' => $subscription->grace_ends_at?->toIso8601String(),
            'duration_days' => (int) $subscription->duration_days,
            'amount' => $subscription->amount !== null ? (float) $subscription->amount : null,
            'currency' => $subscription->currency,
            'notes' => $subscription->notes,
            'updated_at' => $subscription->updated_at?->toIso8601String(),
        ];
    }
}
