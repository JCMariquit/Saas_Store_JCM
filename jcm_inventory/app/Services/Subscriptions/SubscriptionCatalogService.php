<?php

namespace App\Services\Subscriptions;

use Illuminate\Database\ConnectionInterface;
use Illuminate\Support\Facades\DB;

final class SubscriptionCatalogService
{
    public function get(string $productCode): array
    {
        $connection = $this->connection();

        $product = $connection
            ->table('products')
            ->where('product_code', $productCode)
            ->first([
                'id',
                'product_code',
                'name',
                'description',
            ]);

        if ($product === null) {
            return [];
        }

        $plans = $connection
            ->table('plans')
            ->where('product_id', $product->id)
            ->where('status', 'active')
            ->orderBy('sort_order')
            ->get([
                'id',
                'plan_code',
                'plan_name',
                'description',
                'trial_days',
                'sort_order',
                'has_role_based_access',
                'has_multi_branch',
            ]);

        $prices = $connection
            ->table('plan_prices')
            ->whereIn('plan_id', $plans->pluck('id'))
            ->where('status', 'active')
            ->orderBy('sort_order')
            ->get()
            ->groupBy('plan_id');

        $features = $connection
            ->table('plan_features as plan_feature')
            ->join(
                'app_features as feature_record',
                'feature_record.id',
                '=',
                'plan_feature.feature_id'
            )
            ->whereIn('plan_feature.plan_id', $plans->pluck('id'))
            ->where('plan_feature.is_enabled', 1)
            ->where('feature_record.status', 'active')
            ->orderBy('feature_record.sort_order')
            ->get([
                'plan_feature.plan_id',
                'feature_record.feature_code',
                'feature_record.name',
                'feature_record.description',
                'plan_feature.limit_value',
            ])
            ->groupBy('plan_id');

        $roles = $connection
            ->table('plan_user_types as plan_role')
            ->join(
                'product_user_types as product_role',
                'product_role.id',
                '=',
                'plan_role.product_user_type_id'
            )
            ->join(
                'user_types as user_type_record',
                'user_type_record.id',
                '=',
                'product_role.user_type_id'
            )
            ->whereIn('plan_role.plan_id', $plans->pluck('id'))
            ->where('plan_role.is_enabled', 1)
            ->orderBy('user_type_record.sort_order')
            ->get([
                'plan_role.plan_id',
                'user_type_record.type_code',
                DB::raw(
                    'COALESCE(
                        product_role.display_name,
                        user_type_record.name
                    ) as role_name'
                ),
                'plan_role.max_accounts',
            ])
            ->groupBy('plan_id');

        $limits = $connection
            ->table('plan_limits')
            ->whereIn('plan_id', $plans->pluck('id'))
            ->orderBy('limit_code')
            ->get([
                'plan_id',
                'limit_code',
                'limit_value',
                'is_unlimited',
                'description',
            ])
            ->groupBy('plan_id');

        return $plans->map(function (object $plan) use (
            $prices,
            $features,
            $roles,
            $limits
        ): array {
            return [
                'id' => (int) $plan->id,
                'code' => $plan->plan_code,
                'name' => $plan->plan_name,
                'description' => $plan->description,
                'trial_days' => (int) $plan->trial_days,
                'sort_order' => (int) $plan->sort_order,
                'has_role_based_access' =>
                    (bool) $plan->has_role_based_access,
                'has_multi_branch' =>
                    (bool) $plan->has_multi_branch,
                'prices' => collect($prices->get($plan->id, []))
                    ->map(fn (object $price): array => [
                        'id' => (int) $price->id,
                        'billing_interval' =>
                            $price->billing_interval,
                        'price' => (float) $price->price,
                        'compare_at_price' =>
                            $price->compare_at_price !== null
                                ? (float) $price->compare_at_price
                                : null,
                        'currency' => $price->currency,
                        'duration_days' =>
                            (int) $price->duration_days,
                        'is_default' => (bool) $price->is_default,
                    ])
                    ->values()
                    ->all(),
                'features' => collect(
                    $features->get($plan->id, [])
                )
                    ->map(fn (object $feature): array => [
                        'code' => $feature->feature_code,
                        'name' => $feature->name,
                        'description' => $feature->description,
                        'limit_value' =>
                            $feature->limit_value !== null
                                ? (int) $feature->limit_value
                                : null,
                    ])
                    ->values()
                    ->all(),
                'roles' => collect($roles->get($plan->id, []))
                    ->map(fn (object $role): array => [
                        'code' => $role->type_code,
                        'name' => $role->role_name,
                        'max_accounts' =>
                            $role->max_accounts !== null
                                ? (int) $role->max_accounts
                                : null,
                    ])
                    ->values()
                    ->all(),
                'limits' => collect($limits->get($plan->id, []))
                    ->mapWithKeys(fn (object $limit): array => [
                        $limit->limit_code => [
                            'value' => $limit->limit_value !== null
                                ? (int) $limit->limit_value
                                : null,
                            'is_unlimited' =>
                                (bool) $limit->is_unlimited,
                            'description' => $limit->description,
                        ],
                    ])
                    ->all(),
            ];
        })->values()->all();
    }

    private function connection(): ConnectionInterface
    {
        return DB::connection(
            (string) config('jcm.saas_connection', 'saas')
        );
    }
}
