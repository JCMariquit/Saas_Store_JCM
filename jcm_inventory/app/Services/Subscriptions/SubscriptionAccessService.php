<?php

namespace App\Services\Subscriptions;

use App\Models\User;
use Illuminate\Database\ConnectionInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class SubscriptionAccessService
{
    public function __construct(
        private readonly CurrentProductAccessService $currentAccess
    ) {
    }

    public function summary(User $user): ?array
    {
        return $this->currentAccess->resolve($user);
    }

    public function requireOwner(User $user): array
    {
        $context = $this->summary($user);

        if ($context === null) {
            return [
                'user_id' => (int) $user->getKey(),
                'account_owner_id' => (int) $user->getKey(),
                'product_code' => config(
                    'jcm.product_code',
                    'JCM-INVENTORY-001'
                ),
                'is_owner' => true,
                'subscription_id' => null,
                'plan_id' => null,
                'plan_code' => null,
            ];
        }

        if (! $context['is_owner']) {
            throw ValidationException::withMessages([
                'subscription' =>
                    'Only the account owner can manage the subscription.',
            ]);
        }

        return $context;
    }

    public function hasFeature(User $user, string $featureCode): bool
    {
        $context = $this->summary($user);

        if (
            $context === null
            || $context['plan_id'] === null
            || $context['membership_status'] !== 'active'
        ) {
            return false;
        }

        return $this->connection()
            ->table('plan_features as plan_feature')
            ->join(
                'app_features as feature_record',
                'feature_record.id',
                '=',
                'plan_feature.feature_id'
            )
            ->where('plan_feature.plan_id', $context['plan_id'])
            ->where(
                'plan_feature.product_id',
                $context['product_id']
            )
            ->where('feature_record.feature_code', $featureCode)
            ->where('plan_feature.is_enabled', 1)
            ->where('feature_record.status', 'active')
            ->exists();
    }

    public function limit(User $user, string $limitCode): ?int
    {
        $context = $this->summary($user);

        if ($context === null || $context['plan_id'] === null) {
            return null;
        }

        $limit = $this->connection()
            ->table('plan_limits')
            ->where('plan_id', $context['plan_id'])
            ->where('limit_code', $limitCode)
            ->first([
                'limit_value',
                'is_unlimited',
            ]);

        if ($limit === null || (bool) $limit->is_unlimited) {
            return null;
        }

        return $limit->limit_value !== null
            ? (int) $limit->limit_value
            : null;
    }

    private function connection(): ConnectionInterface
    {
        return DB::connection(
            (string) config('jcm.saas_connection', 'saas')
        );
    }
}
