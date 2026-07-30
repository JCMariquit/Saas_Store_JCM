<?php

namespace App\Http\Controllers\Subscriptions;

use App\Http\Controllers\Controller;
use App\Services\Subscriptions\SubscriptionAccessService;
use Illuminate\Database\ConnectionInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

final class SubscriptionWorkspaceController extends Controller
{
    public function __construct(
        private readonly SubscriptionAccessService $access
    ) {
    }

    public function history(Request $request): Response
    {
        $context = $this->ownerContext($request);
        $saas = $this->connection();

        $search = trim((string) $request->input('search', ''));
        $status = trim((string) $request->input('status', ''));

        $allowedStatuses = [
            'pending',
            'payment_submitted',
            'paid',
            'verified',
            'failed',
            'cancelled',
        ];

        if (! in_array($status, $allowedStatuses, true)) {
            $status = '';
        }

        $latestTransactions = $saas
            ->table('transactions')
            ->selectRaw('MAX(id) as transaction_id, order_id')
            ->groupBy('order_id');

        $orders = $saas
            ->table('orders as order_record')
            ->leftJoin(
                'plans as plan_record',
                'plan_record.id',
                '=',
                'order_record.plan_id'
            )
            ->leftJoinSub(
                $latestTransactions,
                'latest_transaction',
                function ($join): void {
                    $join->on(
                        'latest_transaction.order_id',
                        '=',
                        'order_record.id'
                    );
                }
            )
            ->leftJoin(
                'transactions as transaction_record',
                'transaction_record.id',
                '=',
                'latest_transaction.transaction_id'
            )
            ->leftJoin(
                'payment_methods as payment_method',
                'payment_method.id',
                '=',
                'transaction_record.payment_method_id'
            )
            ->where(
                'order_record.account_owner_id',
                $context['account_owner_id']
            )
            ->where(
                'order_record.product_id',
                $context['product_id']
            )
            ->when(
                $search !== '',
                function ($query) use ($search): void {
                    $query->where(
                        function ($query) use ($search): void {
                            $query
                                ->where(
                                    'order_record.order_code',
                                    'like',
                                    "%{$search}%"
                                )
                                ->orWhere(
                                    'transaction_record.transaction_code',
                                    'like',
                                    "%{$search}%"
                                )
                                ->orWhere(
                                    'transaction_record.reference_number',
                                    'like',
                                    "%{$search}%"
                                )
                                ->orWhere(
                                    'plan_record.plan_name',
                                    'like',
                                    "%{$search}%"
                                );
                        }
                    );
                }
            )
            ->when(
                $status !== '',
                fn ($query) => $query->where(
                    'order_record.status',
                    $status
                )
            )
            ->orderByDesc('order_record.id')
            ->select([
                'order_record.id',
                'order_record.order_code',
                'order_record.order_type',
                'order_record.billing_type',
                'order_record.amount',
                'order_record.currency',
                'order_record.status as order_status',
                'order_record.ordered_at',
                'order_record.paid_at as order_paid_at',
                'order_record.verified_at as order_verified_at',
                'order_record.created_at',
                'plan_record.plan_name',
                'transaction_record.transaction_code',
                'transaction_record.reference_number',
                'transaction_record.status as transaction_status',
                'transaction_record.submitted_at',
                'transaction_record.verified_at as transaction_verified_at',
                'payment_method.name as payment_method_name',
            ])
            ->paginate(12)
            ->withQueryString()
            ->through(
                fn (object $record): array => [
                    'id' => (int) $record->id,
                    'order_code' => $record->order_code,
                    'plan_name' => $record->plan_name ?? 'Plan unavailable',
                    'order_type' => $record->order_type,
                    'billing_type' => $record->billing_type,
                    'amount' => (float) $record->amount,
                    'currency' => $record->currency,
                    'order_status' => $record->order_status,
                    'ordered_at' => $record->ordered_at ?? $record->created_at,
                    'paid_at' => $record->order_paid_at,
                    'verified_at' => $record->transaction_verified_at
                        ?? $record->order_verified_at,
                    'transaction_code' => $record->transaction_code,
                    'transaction_status' => $record->transaction_status,
                    'reference_number' => $record->reference_number,
                    'payment_method_name' => $record->payment_method_name,
                    'submitted_at' => $record->submitted_at,
                ]
            );

        $baseOrders = $saas
            ->table('orders')
            ->where(
                'account_owner_id',
                $context['account_owner_id']
            )
            ->where('product_id', $context['product_id']);

        return Inertia::render(
            'settings/subscription/history/index',
            [
                'current' => $context,
                'orders' => $orders,
                'filters' => [
                    'search' => $search,
                    'status' => $status,
                ],
                'summary' => [
                    'total' => (clone $baseOrders)->count(),
                    'pending' => (clone $baseOrders)
                        ->where('status', 'pending')
                        ->count(),
                    'submitted' => (clone $baseOrders)
                        ->where('status', 'payment_submitted')
                        ->count(),
                    'completed' => (clone $baseOrders)
                        ->whereIn('status', ['paid', 'verified'])
                        ->count(),
                    'total_paid' => (float) (clone $baseOrders)
                        ->whereIn('status', ['paid', 'verified'])
                        ->sum('amount'),
                ],
            ]
        );
    }

    public function invoices(Request $request): Response
    {
        $context = $this->ownerContext($request);
        $saas = $this->connection();

        $receipts = $saas
            ->table('transactions as transaction_record')
            ->join(
                'orders as order_record',
                'order_record.id',
                '=',
                'transaction_record.order_id'
            )
            ->leftJoin(
                'plans as plan_record',
                'plan_record.id',
                '=',
                'order_record.plan_id'
            )
            ->leftJoin(
                'payment_methods as payment_method',
                'payment_method.id',
                '=',
                'transaction_record.payment_method_id'
            )
            ->leftJoin(
                'users as verifier',
                'verifier.id',
                '=',
                'transaction_record.verified_by'
            )
            ->where(
                'order_record.account_owner_id',
                $context['account_owner_id']
            )
            ->where(
                'order_record.product_id',
                $context['product_id']
            )
            ->where('transaction_record.status', 'verified')
            ->orderByDesc('transaction_record.verified_at')
            ->orderByDesc('transaction_record.id')
            ->select([
                'transaction_record.id',
                'transaction_record.transaction_code',
                'transaction_record.reference_number',
                'transaction_record.account_name',
                'transaction_record.account_number',
                'transaction_record.amount',
                'transaction_record.status',
                'transaction_record.paid_at',
                'transaction_record.verified_at',
                'transaction_record.created_at',
                'order_record.order_code',
                'order_record.order_type',
                'order_record.billing_type',
                'order_record.currency',
                'plan_record.plan_name',
                'payment_method.name as payment_method_name',
                'verifier.name as verified_by_name',
            ])
            ->paginate(10)
            ->withQueryString()
            ->through(
                fn (object $record): array => [
                    'id' => (int) $record->id,
                    'receipt_code' => $record->transaction_code,
                    'order_code' => $record->order_code,
                    'plan_name' => $record->plan_name ?? 'Plan unavailable',
                    'order_type' => $record->order_type,
                    'billing_type' => $record->billing_type,
                    'amount' => (float) $record->amount,
                    'currency' => $record->currency,
                    'status' => $record->status,
                    'payment_method_name' => $record->payment_method_name,
                    'reference_number' => $record->reference_number,
                    'sender_name' => $record->account_name,
                    'sender_account' => $record->account_number,
                    'paid_at' => $record->paid_at,
                    'verified_at' => $record->verified_at
                        ?? $record->created_at,
                    'verified_by_name' => $record->verified_by_name,
                ]
            );

        $verifiedBase = $saas
            ->table('transactions as transaction_record')
            ->join(
                'orders as order_record',
                'order_record.id',
                '=',
                'transaction_record.order_id'
            )
            ->where(
                'order_record.account_owner_id',
                $context['account_owner_id']
            )
            ->where(
                'order_record.product_id',
                $context['product_id']
            )
            ->where('transaction_record.status', 'verified');

        return Inertia::render(
            'settings/subscription/invoices/index',
            [
                'current' => $context,
                'receipts' => $receipts,
                'summary' => [
                    'total_receipts' => (clone $verifiedBase)->count(),
                    'total_paid' => (float) (clone $verifiedBase)
                        ->sum('transaction_record.amount'),
                    'latest_verified_at' => (clone $verifiedBase)
                        ->max('transaction_record.verified_at'),
                ],
            ]
        );
    }

    public function usage(Request $request): Response
    {
        $context = $this->ownerContext($request);
        $saas = $this->connection();
        $inventory = DB::connection();

        $limits = $context['plan_id'] !== null
            ? $saas
                ->table('plan_limits')
                ->where('plan_id', $context['plan_id'])
                ->get([
                    'limit_code',
                    'limit_value',
                    'is_unlimited',
                    'description',
                ])
                ->keyBy('limit_code')
            : collect();

        $branchQuery = $inventory
            ->table('branches')
            ->where(
                'tenant_id',
                $context['account_owner_id']
            )
            ->whereNull('deleted_at');

        $warehouseQuery = $inventory
            ->table('warehouses')
            ->where(
                'tenant_id',
                $context['account_owner_id']
            )
            ->whereNull('deleted_at');

        $teamQuery = $saas
            ->table('user_product_access as access_record')
            ->join(
                'product_user_types as product_role',
                'product_role.id',
                '=',
                'access_record.product_user_type_id'
            )
            ->join(
                'user_types as user_type',
                'user_type.id',
                '=',
                'product_role.user_type_id'
            )
            ->where(
                'access_record.account_owner_id',
                $context['account_owner_id']
            )
            ->where(
                'access_record.product_id',
                $context['product_id']
            )
            ->where('user_type.is_owner_type', 0)
            ->where('access_record.status', '<>', 'removed');

        $usage = [
            $this->usageItem(
                limits: $limits,
                code: 'max_branches',
                label: 'Branches',
                description: 'Business locations available to this account.',
                used: (clone $branchQuery)->count(),
                active: (clone $branchQuery)
                    ->where('is_active', 1)
                    ->count(),
            ),
            $this->usageItem(
                limits: $limits,
                code: 'max_warehouses',
                label: 'Warehouses',
                description: 'Storage locations across all branches.',
                used: (clone $warehouseQuery)->count(),
                active: (clone $warehouseQuery)
                    ->where('is_active', 1)
                    ->count(),
            ),
            $this->usageItem(
                limits: $limits,
                code: 'max_team_members',
                label: 'Team members',
                description: 'Manager and staff accounts under the owner.',
                used: (clone $teamQuery)->count(),
                active: (clone $teamQuery)
                    ->where('access_record.status', 'active')
                    ->count(),
            ),
        ];

        $nearLimit = collect($usage)
            ->filter(
                fn (array $item): bool =>
                    ! $item['is_unlimited']
                    && $item['limit'] !== null
                    && $item['limit'] > 0
                    && ($item['used'] / $item['limit']) >= 0.8
            )
            ->count();

        $reachedLimit = collect($usage)
            ->filter(
                fn (array $item): bool =>
                    ! $item['is_unlimited']
                    && $item['limit'] !== null
                    && $item['used'] >= $item['limit']
            )
            ->count();

        return Inertia::render(
            'settings/subscription/usage/index',
            [
                'current' => $context,
                'usage' => $usage,
                'summary' => [
                    'tracked_resources' => count($usage),
                    'near_limit' => $nearLimit,
                    'reached_limit' => $reachedLimit,
                ],
            ]
        );
    }

    public function activity(Request $request): Response
    {
        $context = $this->ownerContext($request);
        $saas = $this->connection();
        $activities = collect();

        if ($context['subscription_id'] !== null) {
            $events = $saas
                ->table('subscription_events as event_record')
                ->leftJoin(
                    'plans as old_plan',
                    'old_plan.id',
                    '=',
                    'event_record.old_plan_id'
                )
                ->leftJoin(
                    'plans as new_plan',
                    'new_plan.id',
                    '=',
                    'event_record.new_plan_id'
                )
                ->leftJoin(
                    'users as actor',
                    'actor.id',
                    '=',
                    'event_record.actor_user_id'
                )
                ->where(
                    'event_record.subscription_id',
                    $context['subscription_id']
                )
                ->orderByDesc('event_record.id')
                ->get([
                    'event_record.id',
                    'event_record.event_type',
                    'event_record.old_status',
                    'event_record.new_status',
                    'event_record.notes',
                    'event_record.created_at',
                    'old_plan.plan_name as old_plan_name',
                    'new_plan.plan_name as new_plan_name',
                    'actor.name as actor_name',
                ]);

            foreach ($events as $event) {
                $activities->push([
                    'id' => 'event-'.$event->id,
                    'source' => 'subscription',
                    'type' => $event->event_type,
                    'title' => $this->activityTitle(
                        (string) $event->event_type
                    ),
                    'description' => $event->notes
                        ?: $this->eventDescription($event),
                    'status' => $event->new_status
                        ?? $event->event_type,
                    'reference' => $context['subscription_code'],
                    'actor_name' => $event->actor_name,
                    'occurred_at' => $event->created_at,
                ]);
            }
        }

        $orders = $saas
            ->table('orders as order_record')
            ->leftJoin(
                'plans as plan_record',
                'plan_record.id',
                '=',
                'order_record.plan_id'
            )
            ->where(
                'order_record.account_owner_id',
                $context['account_owner_id']
            )
            ->where(
                'order_record.product_id',
                $context['product_id']
            )
            ->orderByDesc('order_record.id')
            ->limit(30)
            ->get([
                'order_record.id',
                'order_record.order_code',
                'order_record.order_type',
                'order_record.status',
                'order_record.ordered_at',
                'order_record.created_at',
                'plan_record.plan_name',
            ]);

        foreach ($orders as $order) {
            $activities->push([
                'id' => 'order-'.$order->id,
                'source' => 'order',
                'type' => 'order_'.$order->status,
                'title' => 'Subscription order '.str_replace(
                    '_',
                    ' ',
                    (string) $order->status
                ),
                'description' => sprintf(
                    '%s order for %s.',
                    ucfirst(str_replace('_', ' ', $order->order_type)),
                    $order->plan_name ?? 'the selected plan'
                ),
                'status' => $order->status,
                'reference' => $order->order_code,
                'actor_name' => null,
                'occurred_at' => $order->ordered_at
                    ?? $order->created_at,
            ]);
        }

        $transactions = $saas
            ->table('transactions as transaction_record')
            ->join(
                'orders as order_record',
                'order_record.id',
                '=',
                'transaction_record.order_id'
            )
            ->leftJoin(
                'payment_methods as payment_method',
                'payment_method.id',
                '=',
                'transaction_record.payment_method_id'
            )
            ->where(
                'order_record.account_owner_id',
                $context['account_owner_id']
            )
            ->where(
                'order_record.product_id',
                $context['product_id']
            )
            ->orderByDesc('transaction_record.id')
            ->limit(30)
            ->get([
                'transaction_record.id',
                'transaction_record.transaction_code',
                'transaction_record.status',
                'transaction_record.submitted_at',
                'transaction_record.verified_at',
                'transaction_record.updated_at',
                'payment_method.name as payment_method_name',
            ]);

        foreach ($transactions as $transaction) {
            $activities->push([
                'id' => 'transaction-'.$transaction->id,
                'source' => 'payment',
                'type' => 'payment_'.$transaction->status,
                'title' => 'Payment '.str_replace(
                    '_',
                    ' ',
                    (string) $transaction->status
                ),
                'description' => $transaction->payment_method_name
                    ? 'Payment processed through '
                        .$transaction->payment_method_name.'.'
                    : 'Subscription payment status updated.',
                'status' => $transaction->status,
                'reference' => $transaction->transaction_code,
                'actor_name' => null,
                'occurred_at' => $transaction->verified_at
                    ?? $transaction->submitted_at
                    ?? $transaction->updated_at,
            ]);
        }

        $activities = $activities
            ->sortByDesc('occurred_at')
            ->values()
            ->take(50)
            ->all();

        $cycles = $context['subscription_id'] !== null
            ? $saas
                ->table('subscription_cycles as cycle_record')
                ->leftJoin(
                    'plans as plan_record',
                    'plan_record.id',
                    '=',
                    'cycle_record.plan_id'
                )
                ->where(
                    'cycle_record.subscription_id',
                    $context['subscription_id']
                )
                ->orderByDesc('cycle_record.cycle_number')
                ->get([
                    'cycle_record.id',
                    'cycle_record.cycle_number',
                    'cycle_record.billing_type',
                    'cycle_record.status',
                    'cycle_record.start_date',
                    'cycle_record.end_date',
                    'cycle_record.amount',
                    'cycle_record.currency',
                    'cycle_record.activated_at',
                    'cycle_record.completed_at',
                    'plan_record.plan_name',
                ])
                ->map(
                    fn (object $cycle): array => [
                        'id' => (int) $cycle->id,
                        'cycle_number' => (int) $cycle->cycle_number,
                        'plan_name' => $cycle->plan_name
                            ?? 'Plan unavailable',
                        'billing_type' => $cycle->billing_type,
                        'status' => $cycle->status,
                        'start_date' => $cycle->start_date,
                        'end_date' => $cycle->end_date,
                        'amount' => (float) $cycle->amount,
                        'currency' => $cycle->currency,
                        'activated_at' => $cycle->activated_at,
                        'completed_at' => $cycle->completed_at,
                    ]
                )
                ->values()
                ->all()
            : [];

        return Inertia::render(
            'settings/subscription/activity/index',
            [
                'current' => $context,
                'activities' => $activities,
                'cycles' => $cycles,
                'summary' => [
                    'total_activities' => count($activities),
                    'total_cycles' => count($cycles),
                    'active_cycles' => collect($cycles)
                        ->where('status', 'active')
                        ->count(),
                ],
            ]
        );
    }

    private function ownerContext(Request $request): array
    {
        $user = $request->user();

        abort_unless($user, 401);

        $context = $this->access->summary($user);

        if ($context !== null) {
            abort_unless(
                (bool) $context['is_owner'],
                403,
                'Only the account owner can view subscription billing records.'
            );

            return $context;
        }

        $productCode = (string) config(
            'jcm.product_code',
            'JCM-INVENTORY-001'
        );

        $product = $this->connection()
            ->table('products')
            ->where('product_code', $productCode)
            ->first([
                'id',
                'product_code',
                'name',
            ]);

        abort_unless(
            $product,
            404,
            'The JCM Inventory product record was not found.'
        );

        return [
            'access_id' => null,
            'user_id' => (int) $user->getKey(),
            'account_owner_id' => (int) $user->getKey(),
            'product_id' => (int) $product->id,
            'product_user_type_id' => null,
            'product_code' => $product->product_code,
            'product_name' => $product->name,
            'role_code' => 'owner',
            'role_name' => 'Account Owner',
            'membership_status' => 'active',
            'subscription_id' => null,
            'subscription_code' => null,
            'subscription_status' => null,
            'plan_id' => null,
            'plan_price_id' => null,
            'plan_code' => null,
            'plan_name' => null,
            'billing_interval' => null,
            'subscription_type' => null,
            'catalog_price' => null,
            'charged_amount' => null,
            'currency' => 'PHP',
            'start_date' => null,
            'end_date' => null,
            'trial_ends_at' => null,
            'current_period_start' => null,
            'current_period_end' => null,
            'grace_ends_at' => null,
            'cancel_at_period_end' => false,
            'access_mode' => 'blocked',
            'is_owner' => true,
            'is_usable' => false,
            'can_write' => false,
        ];
    }

    private function usageItem(
        Collection $limits,
        string $code,
        string $label,
        string $description,
        int $used,
        int $active,
    ): array {
        $limit = $limits->get($code);

        return [
            'code' => $code,
            'label' => $label,
            'description' => $limit?->description ?? $description,
            'used' => $used,
            'active' => $active,
            'limit' => $limit?->limit_value !== null
                ? (int) $limit->limit_value
                : null,
            'is_unlimited' => (bool) ($limit?->is_unlimited ?? false),
        ];
    }

    private function activityTitle(string $eventType): string
    {
        return match ($eventType) {
            'created' => 'Subscription created',
            'trial_started' => 'Trial started',
            'activated' => 'Subscription activated',
            'renewed' => 'Subscription renewed',
            'upgraded' => 'Plan upgraded',
            'downgraded' => 'Plan changed',
            'payment_failed' => 'Payment failed',
            'past_due' => 'Payment became past due',
            'suspended' => 'Subscription suspended',
            'resumed' => 'Subscription resumed',
            'expired' => 'Subscription expired',
            'cancelled' => 'Subscription cancelled',
            default => ucfirst(str_replace('_', ' ', $eventType)),
        };
    }

    private function eventDescription(object $event): string
    {
        if ($event->old_plan_name || $event->new_plan_name) {
            return trim(sprintf(
                '%s%s%s',
                $event->old_plan_name ?? '',
                $event->old_plan_name && $event->new_plan_name
                    ? ' to '
                    : '',
                $event->new_plan_name ?? ''
            ));
        }

        if ($event->old_status || $event->new_status) {
            return trim(sprintf(
                '%s%s%s',
                $event->old_status ?? '',
                $event->old_status && $event->new_status
                    ? ' to '
                    : '',
                $event->new_status ?? ''
            ));
        }

        return 'Subscription record updated.';
    }

    private function connection(): ConnectionInterface
    {
        return DB::connection(
            (string) config('jcm.saas_connection', 'saas')
        );
    }
}
