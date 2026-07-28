<?php

namespace App\Services\Subscriptions;

use App\Models\User;
use Illuminate\Database\ConnectionInterface;
use Illuminate\Support\Facades\DB;

final class CurrentProductAccessService
{
    public function resolve(User $user, ?int $requestedAccessId = null): ?array
    {
        $connection = $this->connection();
        $productCode = (string) config('jcm.product_code', 'JCM-INVENTORY-001');
        $sessionKey = (string) config(
            'jcm.current_access_session_key',
            'jcm.current_access_id'
        );

        $preference = $connection
            ->table('user_product_preferences')
            ->where('user_id', $user->getKey())
            ->first([
                'default_access_id',
                'last_access_id',
                'landing_behavior',
            ]);

        $candidateIds = array_values(array_unique(array_filter([
            $requestedAccessId,
            session($sessionKey),
            $preference?->last_access_id,
            $preference?->default_access_id,
        ])));

        foreach ($candidateIds as $candidateId) {
            $record = $this->baseQuery($user, $productCode)
                ->where('access_record.id', (int) $candidateId)
                ->first();

            if ($record !== null) {
                return $this->rememberAndTransform(
                    $user,
                    $record,
                    $sessionKey
                );
            }
        }

        $record = $this->baseQuery($user, $productCode)
            ->orderByRaw(
                "CASE
                    WHEN access_record.status = 'active'
                     AND subscription_record.status IN ('trial', 'active')
                    THEN 0
                    WHEN access_record.status = 'active'
                     AND subscription_record.status IN (
                        'past_due',
                        'grace_period',
                        'expired'
                     )
                    THEN 1
                    WHEN access_record.status = 'active'
                    THEN 2
                    ELSE 3
                END"
            )
            ->orderByDesc('access_record.last_accessed_at')
            ->orderByDesc('access_record.id')
            ->first();

        if ($record === null) {
            return null;
        }

        return $this->rememberAndTransform(
            $user,
            $record,
            $sessionKey
        );
    }

    private function baseQuery(User $user, string $productCode)
    {
        return $this->connection()
            ->table('user_product_access as access_record')
            ->join(
                'products as product_record',
                'product_record.id',
                '=',
                'access_record.product_id'
            )
            ->join(
                'product_user_types as product_role',
                'product_role.id',
                '=',
                'access_record.product_user_type_id'
            )
            ->join(
                'user_types as user_type_record',
                'user_type_record.id',
                '=',
                'product_role.user_type_id'
            )
            ->leftJoin(
                'subscriptions as subscription_record',
                'subscription_record.id',
                '=',
                'access_record.subscription_id'
            )
            ->leftJoin(
                'plans as plan_record',
                'plan_record.id',
                '=',
                'subscription_record.plan_id'
            )
            ->leftJoin(
                'plan_prices as plan_price',
                'plan_price.id',
                '=',
                'subscription_record.plan_price_id'
            )
            ->leftJoin(
                'product_subscription_policies as policy_record',
                'policy_record.product_id',
                '=',
                'access_record.product_id'
            )
            ->where('access_record.user_id', $user->getKey())
            ->where('product_record.product_code', $productCode)
            ->where('access_record.status', '<>', 'removed')
            ->select([
                'access_record.id as access_id',
                'access_record.user_id',
                'access_record.account_owner_id',
                'access_record.product_id',
                'access_record.product_user_type_id',
                'access_record.subscription_id',
                'access_record.status as membership_status',
                'access_record.joined_at',
                'access_record.last_accessed_at',
                'product_record.product_code',
                'product_record.name as product_name',
                'user_type_record.type_code as role_code',
                DB::raw(
                    'COALESCE(
                        product_role.display_name,
                        user_type_record.name
                    ) as role_name'
                ),
                'subscription_record.subscription_code',
                'subscription_record.status as subscription_status',
                'subscription_record.plan_id',
                'subscription_record.plan_price_id',
                'subscription_record.subscription_type',
                'subscription_record.start_date',
                'subscription_record.end_date',
                'subscription_record.trial_ends_at',
                'subscription_record.current_period_start',
                'subscription_record.current_period_end',
                'subscription_record.grace_ends_at',
                'subscription_record.cancel_at_period_end',
                'subscription_record.amount as charged_amount',
                'subscription_record.currency',
                'plan_record.plan_code',
                'plan_record.plan_name',
                'plan_price.billing_interval',
                'plan_price.price as catalog_price',
                'policy_record.past_due_access_mode',
                'policy_record.expired_access_mode',
            ]);
    }

    private function rememberAndTransform(
        User $user,
        object $record,
        string $sessionKey
    ): array {
        $connection = $this->connection();
        $accessMode = $this->accessMode($record);

        session([$sessionKey => (int) $record->access_id]);

        $connection
            ->table('user_product_access')
            ->where('id', $record->access_id)
            ->update([
                'last_accessed_at' => now(),
                'updated_at' => now(),
            ]);

        $connection
            ->table('user_product_preferences')
            ->updateOrInsert(
                ['user_id' => $user->getKey()],
                [
                    'default_access_id' => $record->access_id,
                    'last_access_id' => $record->access_id,
                    'landing_behavior' => 'last_used',
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );

        return [
            'access_id' => (int) $record->access_id,
            'user_id' => (int) $record->user_id,
            'account_owner_id' => (int) $record->account_owner_id,
            'product_id' => (int) $record->product_id,
            'product_user_type_id' => (int) $record->product_user_type_id,
            'product_code' => $record->product_code,
            'product_name' => $record->product_name,
            'role_code' => $record->role_code,
            'role_name' => $record->role_name,
            'membership_status' => $record->membership_status,
            'subscription_id' => $record->subscription_id !== null
                ? (int) $record->subscription_id
                : null,
            'subscription_code' => $record->subscription_code,
            'subscription_status' => $record->subscription_status,
            'plan_id' => $record->plan_id !== null
                ? (int) $record->plan_id
                : null,
            'plan_price_id' => $record->plan_price_id !== null
                ? (int) $record->plan_price_id
                : null,
            'plan_code' => $record->plan_code,
            'plan_name' => $record->plan_name,
            'billing_interval' => $record->billing_interval,
            'subscription_type' => $record->subscription_type,
            'catalog_price' => $record->catalog_price !== null
                ? (float) $record->catalog_price
                : null,
            'charged_amount' => $record->charged_amount !== null
                ? (float) $record->charged_amount
                : null,
            'currency' => $record->currency,
            'start_date' => $record->start_date,
            'end_date' => $record->end_date,
            'trial_ends_at' => $record->trial_ends_at,
            'current_period_start' => $record->current_period_start,
            'current_period_end' => $record->current_period_end,
            'grace_ends_at' => $record->grace_ends_at,
            'cancel_at_period_end' => (bool) $record->cancel_at_period_end,
            'access_mode' => $accessMode,
            'is_owner' => $record->role_code === 'owner',
            'is_usable' => in_array(
                $accessMode,
                ['full', 'read_only'],
                true
            ),
            'can_write' => $accessMode === 'full',
        ];
    }

    private function accessMode(object $record): string
    {
        if ($record->membership_status !== 'active') {
            return 'blocked';
        }

        return match ($record->subscription_status) {
            'trial', 'active' => 'full',
            'past_due', 'grace_period' =>
                $record->past_due_access_mode ?: 'read_only',
            'expired' =>
                $record->expired_access_mode ?: 'read_only',
            default => 'blocked',
        };
    }

    private function connection(): ConnectionInterface
    {
        return DB::connection(
            (string) config('jcm.saas_connection', 'saas')
        );
    }
}
