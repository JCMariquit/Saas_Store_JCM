<?php

namespace App\Services\Subscriptions;

use App\Models\User;
use Illuminate\Database\ConnectionInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

final class SubscriptionCheckoutService
{
    public function __construct(
        private readonly SubscriptionAccessService $access
    ) {
    }

    public function createOrder(User $user, int $planPriceId): object
    {
        $connection = $this->connection();
        $context = $this->access->requireOwner($user);
        $productCode = (string) config(
            'jcm.product_code',
            'JCM-INVENTORY-001'
        );

        $selected = $connection
            ->table('plan_prices as plan_price')
            ->join(
                'plans as plan_record',
                'plan_record.id',
                '=',
                'plan_price.plan_id'
            )
            ->join(
                'products as product_record',
                'product_record.id',
                '=',
                'plan_record.product_id'
            )
            ->where('plan_price.id', $planPriceId)
            ->where('plan_price.status', 'active')
            ->where('plan_record.status', 'active')
            ->where('product_record.product_code', $productCode)
            ->first([
                'plan_price.id as plan_price_id',
                'plan_price.billing_interval',
                'plan_price.price',
                'plan_price.currency',
                'plan_price.duration_days',
                'plan_record.id as plan_id',
                'plan_record.sort_order',
                'product_record.id as product_id',
            ]);

        if ($selected === null) {
            throw ValidationException::withMessages([
                'plan_price_id' =>
                    'The selected subscription price is unavailable.',
            ]);
        }

        return $connection->transaction(function () use (
            $connection,
            $context,
            $selected,
            $user
        ): object {
            $existingPending = $connection
                ->table('orders')
                ->where(
                    'account_owner_id',
                    $context['account_owner_id']
                )
                ->where('product_id', $selected->product_id)
                ->whereIn('status', [
                    'pending',
                    'payment_submitted',
                ])
                ->orderByDesc('id')
                ->first();

            if ($existingPending !== null) {
                if ($existingPending->status === 'payment_submitted') {
                    throw ValidationException::withMessages([
                        'subscription' =>
                            'A payment is already waiting for verification.',
                    ]);
                }

                $connection
                    ->table('orders')
                    ->where('id', $existingPending->id)
                    ->update([
                        'plan_id' => $selected->plan_id,
                        'plan_price_id' => $selected->plan_price_id,
                        'billing_type' =>
                            $selected->billing_interval,
                        'subscription_id' =>
                            $context['subscription_id'],
                        'order_type' => $this->orderType(
                            $connection,
                            $context,
                            (int) $selected->plan_id,
                            (int) $selected->sort_order
                        ),
                        'amount' => $selected->price,
                        'currency' => $selected->currency,
                        'duration_days' =>
                            $selected->duration_days,
                        'ordered_at' => now(),
                        'updated_at' => now(),
                    ]);

                return $connection
                    ->table('orders')
                    ->where('id', $existingPending->id)
                    ->first();
            }

            $orderId = $connection
                ->table('orders')
                ->insertGetId([
                    'order_code' => sprintf(
                        'ORD-SUB-%d-%s-%s',
                        $context['account_owner_id'],
                        now()->format('YmdHis'),
                        Str::upper(Str::random(6))
                    ),
                    'user_id' => $user->getKey(),
                    'account_owner_id' =>
                        $context['account_owner_id'],
                    'product_id' => $selected->product_id,
                    'service_id' => null,
                    'plan_id' => $selected->plan_id,
                    'plan_price_id' => $selected->plan_price_id,
                    'billing_type' =>
                        $selected->billing_interval,
                    'subscription_id' =>
                        $context['subscription_id'],
                    'order_type' => $this->orderType(
                        $connection,
                        $context,
                        (int) $selected->plan_id,
                        (int) $selected->sort_order
                    ),
                    'amount' => $selected->price,
                    'currency' => $selected->currency,
                    'duration_days' => $selected->duration_days,
                    'status' => 'pending',
                    'ordered_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

            return $connection
                ->table('orders')
                ->where('id', $orderId)
                ->first();
        });
    }

    private function orderType(
        ConnectionInterface $connection,
        array $context,
        int $targetPlanId,
        int $targetSortOrder
    ): string {
        if ($context['subscription_id'] === null) {
            return 'new_subscription';
        }

        if ((int) $context['plan_id'] === $targetPlanId) {
            return 'renewal';
        }

        $currentSortOrder = $connection
            ->table('plans')
            ->where('id', $context['plan_id'])
            ->value('sort_order');

        return $targetSortOrder > (int) $currentSortOrder
            ? 'upgrade'
            : 'downgrade';
    }

    private function connection(): ConnectionInterface
    {
        return DB::connection(
            (string) config('jcm.saas_connection', 'saas')
        );
    }
}
