<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;

final class DynamicSidebarService
{
    private const FEATURE_PERMISSION_ITEM_KEYS = [
        'stock_adjustment' => [
            'stock-management',
        ],
        'stock_transfer' => [
            'stock-management',
        ],
    ];

    /**
     * These modules require a fully paid/trial subscription even though
     * their page request may use GET.
     *
     * Core record and audit pages remain readable:
     *
     * - Dashboard
     * - Stock Overview
     * - Categories
     * - Products
     * - Stock Management
     * - Received Orders
     *
     * Operational and configuration pages listed below display a RENEW lock
     * when the owner subscription is past due, in grace period, or expired.
     */
    private const ACTIVE_ONLY_ITEM_KEYS = [
        /*
        |--------------------------------------------------------------------------
        | Inventory operations
        |--------------------------------------------------------------------------
        */
        'stock-issuance-terminal',
        'stock-issuance-history',
        'stock-movements',

        /*
        |--------------------------------------------------------------------------
        | Location administration
        |--------------------------------------------------------------------------
        */
        'branches',
        'warehouses',

        /*
        |--------------------------------------------------------------------------
        | Procurement operations
        |--------------------------------------------------------------------------
        */
        'suppliers',
        'purchase-orders',
        'purchase-approvals',
        'receiving',

        /*
        |--------------------------------------------------------------------------
        | Team overview and administration
        |--------------------------------------------------------------------------
        */
        'team-overview',
        'staff-accounts',
        'roles-access',

        /*
        |--------------------------------------------------------------------------
        | Business configuration
        |--------------------------------------------------------------------------
        */
        'business-profile-general',
        'business-profile-branding',
    ];

    /**
     * Subscription states that retain their plan identity and sidebar.
     *
     * Active and trial accounts have full access.
     * Past due, grace period, and expired accounts keep read-only access.
     */
    private const SIDEBAR_SUBSCRIPTION_STATUSES = [
        'active',
        'trial',
        'past_due',
        'grace_period',
        'expired',
    ];

    private const READ_ONLY_SUBSCRIPTION_STATUSES = [
        'past_due',
        'grace_period',
        'expired',
    ];

    public function forUser(
        User $user,
        string $productCode
    ): array {
        $product = $this->findProduct(
            $productCode
        );

        if (! $product) {
            return $this->emptyPayload();
        }

        $access = $this->resolveAccess(
            $user,
            (int) $product->id
        );

        if (! $access) {
            return $this->emptyPayload(
                $product
            );
        }

        $subscription =
            $this->resolveSubscription(
                $access,
                (int) $product->id
            );

        if (! $subscription) {
            return $this->emptyPayload(
                $product,
                $access
            );
        }

        $sidebarItemIds =
            $this->resolveSidebarItemIds(
                $access
            );

        $rows = $this->sidebarRows(
            (int) $product->id,
            (int) $subscription->plan_id,
            $sidebarItemIds
        );

        $requiredPlans =
            $this->requiredPlansForRows(
                (int) $product->id,
                (int) $subscription->plan_id,
                $rows
            );

        return $this->payload(
            $product,
            $access,
            $subscription,
            $rows,
            $requiredPlans
        );
    }

    public function canAccessFeature(
        User $user,
        string $productCode,
        string $featureCode
    ): bool {
        $product = $this->findProduct(
            $productCode
        );

        if (! $product) {
            return false;
        }

        $access = $this->resolveAccess(
            $user,
            (int) $product->id
        );

        if (! $access) {
            return false;
        }

        $subscription =
            $this->resolveSubscription(
                $access,
                (int) $product->id
            );

        if (! $subscription) {
            return false;
        }

        $feature = DB::connection('saas')
            ->table(
                'app_features as feature'
            )
            ->join(
                'plan_features as plan_feature',
                function ($join) use (
                    $subscription
                ): void {
                    $join
                        ->on(
                            'plan_feature.feature_id',
                            '=',
                            'feature.id'
                        )
                        ->where(
                            'plan_feature.plan_id',
                            '=',
                            $subscription->plan_id
                        )
                        ->where(
                            'plan_feature.is_enabled',
                            '=',
                            1
                        );
                }
            )
            ->where(
                'feature.product_id',
                $product->id
            )
            ->where(
                'feature.feature_code',
                $featureCode
            )
            ->where(
                'feature.status',
                'active'
            )
            ->where(
                'feature.is_developer_ready',
                1
            )
            ->first([
                'feature.id',
                'feature.feature_code',
            ]);

        if (! $feature) {
            return false;
        }

        if ((bool) $access->is_owner_type) {
            return true;
        }

        $allowedSidebarItemIds =
            $this->resolveSidebarItemIds(
                $access
            );

        if (count($allowedSidebarItemIds) === 0) {
            return false;
        }

        $mappedItemKeys =
            self::FEATURE_PERMISSION_ITEM_KEYS[
                $featureCode
            ] ?? [];

        $permissionItemIds =
            DB::connection('saas')
                ->table(
                    'sidebar_items as sidebar'
                )
                ->where(
                    'sidebar.product_id',
                    $product->id
                )
                ->where(
                    'sidebar.status',
                    'active'
                )
                ->where(
                    'sidebar.is_visible',
                    1
                )
                ->where(
                    'sidebar.is_developer_ready',
                    1
                )
                ->where(
                    function ($query) use (
                        $feature,
                        $mappedItemKeys
                    ): void {
                        $query->where(
                            'sidebar.feature_id',
                            $feature->id
                        );

                        if (
                            count(
                                $mappedItemKeys
                            ) > 0
                        ) {
                            $query->orWhereIn(
                                'sidebar.item_key',
                                $mappedItemKeys
                            );
                        }
                    }
                )
                ->pluck('sidebar.id')
                ->map(
                    fn ($id): int =>
                        (int) $id
                )
                ->all();

        return count(
            array_intersect(
                $allowedSidebarItemIds,
                $permissionItemIds
            )
        ) > 0;
    }

    /**
     * Return the first active plan that includes a feature missing from the
     * user's current plan. A null result means the feature is already in the
     * plan, does not exist, is unavailable, or is denied by role configuration.
     *
     * @return array{
     *     id:int,
     *     code:string,
     *     name:string,
     *     monthlyPrice:float,
     *     currency:string
     * }|null
     */
    public function requiredPlanForFeature(
        User $user,
        string $productCode,
        string $featureCode
    ): ?array {
        $product = $this->findProduct(
            $productCode
        );

        if (! $product) {
            return null;
        }

        $access = $this->resolveAccess(
            $user,
            (int) $product->id
        );

        if (! $access) {
            return null;
        }

        $subscription =
            $this->resolveSubscription(
                $access,
                (int) $product->id
            );

        if (! $subscription) {
            return null;
        }

        $feature = DB::connection('saas')
            ->table('app_features')
            ->where(
                'product_id',
                $product->id
            )
            ->where(
                'feature_code',
                $featureCode
            )
            ->where(
                'status',
                'active'
            )
            ->where(
                'is_developer_ready',
                1
            )
            ->first([
                'id',
                'feature_code',
            ]);

        if (! $feature) {
            return null;
        }

        $currentPlanHasFeature =
            DB::connection('saas')
                ->table('plan_features')
                ->where(
                    'plan_id',
                    $subscription->plan_id
                )
                ->where(
                    'feature_id',
                    $feature->id
                )
                ->where(
                    'is_enabled',
                    1
                )
                ->exists();

        if ($currentPlanHasFeature) {
            return null;
        }

        $plan = DB::connection('saas')
            ->table(
                'plan_features as plan_feature'
            )
            ->join(
                'plans as plan',
                'plan.id',
                '=',
                'plan_feature.plan_id'
            )
            ->where(
                'plan.product_id',
                $product->id
            )
            ->where(
                'plan_feature.feature_id',
                $feature->id
            )
            ->where(
                'plan_feature.is_enabled',
                1
            )
            ->where(
                'plan.status',
                'active'
            )
            ->where(
                'plan.id',
                '!=',
                $subscription->plan_id
            )
            ->orderBy(
                'plan.sort_order'
            )
            ->orderBy(
                'plan.id'
            )
            ->first([
                'plan.id',
                'plan.plan_code',
                'plan.plan_name',
                'plan.price',
                'plan.currency',
            ]);

        return $plan
            ? $this->planReference($plan)
            : null;
    }

    private function findProduct(
        string $productCode
    ): ?object {
        return DB::connection('saas')
            ->table('products')
            ->where(
                'product_code',
                $productCode
            )
            ->whereIn(
                'status',
                [
                    'development',
                    'active',
                    'maintenance',
                    'paused',
                ]
            )
            ->first([
                'id',
                'product_code',
                'name',
                'slug',
                'status',
            ]);
    }

    private function resolveAccess(
        User $user,
        int $productId
    ): ?object {
        return DB::connection('saas')
            ->table(
                'user_product_access as access'
            )
            ->join(
                'product_user_types as product_role',
                function ($join): void {
                    $join
                        ->on(
                            'product_role.id',
                            '=',
                            'access.product_user_type_id'
                        )
                        ->on(
                            'product_role.product_id',
                            '=',
                            'access.product_id'
                        );
                }
            )
            ->join(
                'user_types as user_type',
                'user_type.id',
                '=',
                'product_role.user_type_id'
            )
            ->leftJoin(
                'user_product_access as owner_access',
                function ($join): void {
                    $join
                        ->on(
                            'owner_access.user_id',
                            '=',
                            'access.account_owner_id'
                        )
                        ->on(
                            'owner_access.product_id',
                            '=',
                            'access.product_id'
                        )
                        ->on(
                            'owner_access.account_owner_id',
                            '=',
                            'access.account_owner_id'
                        )
                        ->where(
                            'owner_access.status',
                            '=',
                            'active'
                        );
                }
            )
            ->where(
                'access.user_id',
                $user->id
            )
            ->where(
                'access.product_id',
                $productId
            )
            ->where(
                'access.status',
                'active'
            )
            ->where(
                'product_role.status',
                'active'
            )
            ->where(
                'user_type.status',
                'active'
            )
            ->orderByDesc(
                'access.id'
            )
            ->first([
                'access.id',
                'access.user_id',
                'access.product_id',
                'access.product_user_type_id',
                'access.account_owner_id',
                'user_type.type_code',
                'user_type.is_owner_type',
                DB::raw(
                    'COALESCE(
                        product_role.display_name,
                        user_type.name
                    ) as user_type_name'
                ),
                DB::raw(
                    'COALESCE(
                        access.subscription_id,
                        owner_access.subscription_id
                    ) as resolved_subscription_id'
                ),
            ]);
    }

    private function resolveSubscription(
        object $access,
        int $productId
    ): ?object {
        $query = DB::connection('saas')
            ->table(
                'subscriptions as subscription'
            )
            ->join(
                'plans as plan',
                function ($join): void {
                    $join
                        ->on(
                            'plan.id',
                            '=',
                            'subscription.plan_id'
                        )
                        ->on(
                            'plan.product_id',
                            '=',
                            'subscription.product_id'
                        );
                }
            )
            ->where(
                'subscription.product_id',
                $productId
            )
            ->where(
                'subscription.account_owner_id',
                $access->account_owner_id
            )
            ->whereIn(
                'subscription.status',
                self::SIDEBAR_SUBSCRIPTION_STATUSES
            )
            ->where(
                'plan.status',
                'active'
            );

        /*
        |--------------------------------------------------------------------------
        | Prefer the subscription explicitly assigned to product access
        |--------------------------------------------------------------------------
        |
        | Owner, Manager, and Staff rows should point to the same owner
        | subscription. Expired subscriptions remain resolvable so their plan
        | features and sidebar can still be displayed in read-only mode.
        |
        */

        if (
            $access->resolved_subscription_id
        ) {
            $subscription =
                (clone $query)
                    ->where(
                        'subscription.id',
                        $access
                            ->resolved_subscription_id
                    )
                    ->first(
                        $this->subscriptionColumns()
                    );

            if ($subscription) {
                return $subscription;
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Fallback to the best owner subscription for this product
        |--------------------------------------------------------------------------
        |
        | Status is the lifecycle authority. We intentionally do not reject a
        | row because its end_date is in the past; that is exactly how an
        | expired subscription keeps its plan identity for read-only access.
        |
        */

        return $query
            ->orderByRaw(
                "CASE subscription.status
                    WHEN 'active' THEN 10
                    WHEN 'trial' THEN 20
                    WHEN 'grace_period' THEN 30
                    WHEN 'past_due' THEN 40
                    WHEN 'expired' THEN 50
                    ELSE 100
                END"
            )
            ->orderByDesc(
                'subscription.id'
            )
            ->first(
                $this->subscriptionColumns()
            );
    }

    /**
     * @return array<int, string>
     */
    private function subscriptionColumns(): array
    {
        return [
            'subscription.id',
            'subscription.plan_id',
            'subscription.plan_price_id',
            'subscription.subscription_type',
            'subscription.status',
            'subscription.start_date',
            'subscription.end_date',
            'subscription.trial_ends_at',
            'subscription.current_period_start',
            'subscription.current_period_end',
            'subscription.grace_ends_at',
            'subscription.cancel_at_period_end',
            'plan.plan_code',
            'plan.plan_name',
            'plan.price as plan_monthly_price',
            'plan.currency as plan_currency',
            'plan.sort_order as plan_sort_order',
        ];
    }

    private function resolveSidebarItemIds(
        object $access
    ): array {
        $saas = DB::connection('saas');

        if ((bool) $access->is_owner_type) {
            return $saas
                ->table('sidebar_items')
                ->where(
                    'product_id',
                    $access->product_id
                )
                ->where(
                    'status',
                    'active'
                )
                ->where(
                    'is_visible',
                    1
                )
                ->pluck('id')
                ->map(
                    fn ($id): int =>
                        (int) $id
                )
                ->unique()
                ->sort()
                ->values()
                ->all();
        }

        $tenantPermissionQuery = $saas
            ->table(
                'account_role_sidebar_items'
            )
            ->where(
                'account_owner_id',
                $access->account_owner_id
            )
            ->where(
                'product_id',
                $access->product_id
            )
            ->where(
                'product_user_type_id',
                $access->product_user_type_id
            );

        if (
            $tenantPermissionQuery->exists()
        ) {
            $sidebarItemIds =
                (clone $tenantPermissionQuery)
                    ->where(
                        'is_enabled',
                        1
                    )
                    ->pluck(
                        'sidebar_item_id'
                    )
                    ->map(
                        fn ($id): int =>
                            (int) $id
                    )
                    ->all();

            return $this->includeParentItems(
                $sidebarItemIds,
                (int) $access->product_id
            );
        }

        $sidebarItemIds = $saas
            ->table(
                'product_user_type_sidebar_items as permission'
            )
            ->join(
                'sidebar_items as sidebar',
                'sidebar.id',
                '=',
                'permission.sidebar_item_id'
            )
            ->where(
                'permission.product_user_type_id',
                $access->product_user_type_id
            )
            ->where(
                'permission.is_enabled',
                1
            )
            ->where(
                'sidebar.product_id',
                $access->product_id
            )
            ->pluck(
                'permission.sidebar_item_id'
            )
            ->map(
                fn ($id): int =>
                    (int) $id
            )
            ->all();

        return $this->includeParentItems(
            $sidebarItemIds,
            (int) $access->product_id
        );
    }

    private function includeParentItems(
        array $sidebarItemIds,
        int $productId
    ): array {
        if (count($sidebarItemIds) === 0) {
            return [];
        }

        $rows = DB::connection('saas')
            ->table('sidebar_items')
            ->where(
                'product_id',
                $productId
            )
            ->get([
                'id',
                'parent_id',
            ]);

        $parentMap = [];

        foreach ($rows as $row) {
            $parentMap[(int) $row->id] =
                $row->parent_id === null
                    ? null
                    : (int) $row->parent_id;
        }

        $result = collect(
            $sidebarItemIds
        )
            ->map(
                fn ($id): int =>
                    (int) $id
            )
            ->unique()
            ->values();

        foreach (
            $result->all() as $itemId
        ) {
            $currentId = $itemId;

            while (
                array_key_exists(
                    $currentId,
                    $parentMap
                )
                && $parentMap[
                    $currentId
                ] !== null
            ) {
                $parentId = (int) (
                    $parentMap[$currentId]
                );

                $result->push(
                    $parentId
                );

                $currentId = $parentId;
            }
        }

        return $result
            ->unique()
            ->sort()
            ->values()
            ->all();
    }

    private function sidebarRows(
        int $productId,
        int $planId,
        array $sidebarItemIds
    ): Collection {
        if (count($sidebarItemIds) === 0) {
            return collect();
        }

        return DB::connection('saas')
            ->table(
                'sidebar_items as sidebar'
            )
            ->leftJoin(
                'app_features as feature',
                function ($join): void {
                    $join
                        ->on(
                            'feature.id',
                            '=',
                            'sidebar.feature_id'
                        )
                        ->on(
                            'feature.product_id',
                            '=',
                            'sidebar.product_id'
                        );
                }
            )
            ->leftJoin(
                'plan_features as plan_feature',
                function ($join) use (
                    $planId
                ): void {
                    $join
                        ->on(
                            'plan_feature.feature_id',
                            '=',
                            'sidebar.feature_id'
                        )
                        ->where(
                            'plan_feature.plan_id',
                            '=',
                            $planId
                        )
                        ->where(
                            'plan_feature.is_enabled',
                            '=',
                            1
                        );
                }
            )
            ->leftJoin(
                'sidebar_badges as badge',
                'badge.id',
                '=',
                'sidebar.badge_id'
            )
            ->where(
                'sidebar.product_id',
                $productId
            )
            ->whereIn(
                'sidebar.id',
                $sidebarItemIds
            )
            ->where(
                'sidebar.status',
                'active'
            )
            ->where(
                'sidebar.is_visible',
                1
            )
            ->where(
                function ($query): void {
                    $query
                        ->whereNull(
                            'sidebar.feature_id'
                        )
                        ->orWhere(
                            'feature.status',
                            'active'
                        );
                }
            )
            ->orderByRaw(
                "CASE sidebar.section_key
                    WHEN 'overview' THEN 10
                    WHEN 'management' THEN 20
                    WHEN 'reports' THEN 30
                    WHEN 'settings' THEN 40
                    ELSE 100
                END"
            )
            ->orderBy(
                'sidebar.sort_order'
            )
            ->orderBy(
                'sidebar.id'
            )
            ->get([
                'sidebar.id',
                'sidebar.parent_id',
                'sidebar.feature_id',
                'sidebar.item_key',
                'sidebar.section_key',
                'sidebar.item_type',
                'sidebar.label',
                'sidebar.route_name',
                'sidebar.url_override',
                'sidebar.icon_key',
                'sidebar.sort_order',
                'sidebar.is_developer_ready',
                'feature.feature_code',
                'feature.is_developer_ready as feature_is_developer_ready',
                'plan_feature.id as current_plan_feature_id',
                DB::raw(
                    'COALESCE(
                        badge.badge_code,
                        sidebar.badge
                    ) as badge_code'
                ),
                'badge.name as badge_name',
                'badge.icon_key as badge_icon_key',
                'badge.style_key as badge_style_key',
            ]);
    }

    /**
     * @return array<int, array{
     *     id:int,
     *     code:string,
     *     name:string,
     *     monthlyPrice:float,
     *     currency:string
     * }>
     */
    private function requiredPlansForRows(
        int $productId,
        int $currentPlanId,
        Collection $rows
    ): array {
        $featureIds = $rows
            ->filter(
                fn (object $row): bool =>
                    $row->feature_id !== null
                    && $row->current_plan_feature_id
                        === null
                    && (bool) (
                        $row
                            ->feature_is_developer_ready
                        ?? false
                    )
            )
            ->pluck('feature_id')
            ->map(
                fn ($id): int => (int) $id
            )
            ->unique()
            ->values()
            ->all();

        if (count($featureIds) === 0) {
            return [];
        }

        $plans = DB::connection('saas')
            ->table(
                'plan_features as plan_feature'
            )
            ->join(
                'plans as plan',
                'plan.id',
                '=',
                'plan_feature.plan_id'
            )
            ->where(
                'plan.product_id',
                $productId
            )
            ->whereIn(
                'plan_feature.feature_id',
                $featureIds
            )
            ->where(
                'plan_feature.is_enabled',
                1
            )
            ->where(
                'plan.status',
                'active'
            )
            ->where(
                'plan.id',
                '!=',
                $currentPlanId
            )
            ->orderBy(
                'plan.sort_order'
            )
            ->orderBy(
                'plan.id'
            )
            ->get([
                'plan_feature.feature_id',
                'plan.id',
                'plan.plan_code',
                'plan.plan_name',
                'plan.price',
                'plan.currency',
            ]);

        $result = [];

        foreach ($plans as $plan) {
            $featureId =
                (int) $plan->feature_id;

            if (
                ! array_key_exists(
                    $featureId,
                    $result
                )
            ) {
                $result[$featureId] =
                    $this->planReference(
                        $plan
                    );
            }
        }

        return $result;
    }

    /**
     * @return array{
     *     id:int,
     *     code:string,
     *     name:string,
     *     monthlyPrice:float,
     *     currency:string
     * }
     */
    private function planReference(
        object $plan
    ): array {
        return [
            'id' => (int) $plan->id,
            'code' =>
                (string) $plan->plan_code,
            'name' =>
                (string) $plan->plan_name,
            'monthlyPrice' =>
                (float) $plan->price,
            'currency' =>
                (string) (
                    $plan->currency
                    ?? 'PHP'
                ),
        ];
    }

    private function payload(
        object $product,
        object $access,
        object $subscription,
        Collection $rows,
        array $requiredPlans
    ): array {
        return [
            'product' => [
                'id' =>
                    (int) $product->id,
                'code' =>
                    $product->product_code,
                'name' =>
                    $product->name,
                'slug' =>
                    $product->slug,
                'status' =>
                    $product->status,
            ],
            'access' => [
                'roleCode' =>
                    $access->type_code,
                'roleName' =>
                    $access->user_type_name,
                'accountOwnerId' =>
                    (int) $access
                        ->account_owner_id,
            ],
            'subscription' => [
                'id' =>
                    (int) $subscription->id,
                'planId' =>
                    (int) $subscription->plan_id,
                'planCode' =>
                    (string) $subscription
                        ->plan_code,
                'planName' =>
                    (string) $subscription
                        ->plan_name,
                'monthlyPrice' =>
                    (float) $subscription
                        ->plan_monthly_price,
                'currency' =>
                    (string) $subscription
                        ->plan_currency,
                'planPriceId' =>
                    $subscription->plan_price_id
                        ? (int) $subscription
                            ->plan_price_id
                        : null,
                'type' =>
                    $subscription
                        ->subscription_type,
                'status' =>
                    $subscription->status,
                'accessMode' =>
                    $this->subscriptionAccessMode(
                        $subscription->status
                    ),
                'isReadOnly' =>
                    in_array(
                        $subscription->status,
                        self::READ_ONLY_SUBSCRIPTION_STATUSES,
                        true
                    ),
                'startDate' =>
                    $subscription->start_date,
                'endDate' =>
                    $subscription->end_date,
                'trialEndsAt' =>
                    $subscription->trial_ends_at,
                'currentPeriodStart' =>
                    $subscription
                        ->current_period_start,
                'currentPeriodEnd' =>
                    $subscription
                        ->current_period_end,
                'graceEndsAt' =>
                    $subscription->grace_ends_at,
                'cancelAtPeriodEnd' =>
                    (bool) $subscription
                        ->cancel_at_period_end,
            ],
            'sections' =>
                $this->buildSections(
                    $rows,
                    $requiredPlans,
                    (string) $subscription
                        ->status
                ),
        ];
    }

    private function buildSections(
        Collection $rows,
        array $requiredPlans,
        string $subscriptionStatus
    ): array {
        $items = [];

        $isReadOnly = in_array(
            $subscriptionStatus,
            self::READ_ONLY_SUBSCRIPTION_STATUSES,
            true
        );

        foreach ($rows as $row) {
            $url = $this->resolveUrl(
                $row
            );

            $featureDeveloperReady =
                $row->feature_id === null
                || (bool) (
                    $row
                        ->feature_is_developer_ready
                    ?? false
                );

            $planLocked =
                $row->item_type === 'link'
                && $row->feature_id !== null
                && $row->current_plan_feature_id
                    === null
                && (bool) $row
                    ->is_developer_ready
                && $featureDeveloperReady
                && $url !== '#';

            $subscriptionLocked =
                $row->item_type === 'link'
                && $isReadOnly
                && in_array(
                    $row->item_key,
                    self::ACTIVE_ONLY_ITEM_KEYS,
                    true
                )
                && ! $planLocked
                && (bool) $row
                    ->is_developer_ready
                && $featureDeveloperReady
                && $url !== '#';

            $lockReason = $planLocked
                ? 'plan'
                : (
                    $subscriptionLocked
                        ? 'subscription'
                        : null
                );

            $items[$row->id] = [
                'id' => (int) $row->id,
                'key' =>
                    $row->item_key,
                'sectionKey' =>
                    $row->section_key,
                'type' =>
                    $row->item_type,
                'title' =>
                    $row->label,
                'url' => $url,
                'iconKey' =>
                    $row->icon_key,
                'featureCode' =>
                    $row->feature_code,
                'disabled' =>
                    $row->item_type
                        === 'link'
                    && (
                        ! (bool) $row
                            ->is_developer_ready
                        || ! $featureDeveloperReady
                        || $url === '#'
                    ),
                'planLocked' =>
                    $planLocked,
                'subscriptionLocked' =>
                    $subscriptionLocked,
                'lockReason' =>
                    $lockReason,
                'requiredPlan' =>
                    $planLocked
                    && $row->feature_id !== null
                        ? (
                            $requiredPlans[
                                (int) $row
                                    ->feature_id
                            ] ?? null
                        )
                        : null,
                'sortOrder' =>
                    (int) $row->sort_order,
                'badge' =>
                    $row->badge_code
                        ? [
                            'code' =>
                                $row
                                    ->badge_code,
                            'name' =>
                                $row
                                    ->badge_name
                                ?: $row
                                    ->badge_code,
                            'iconKey' =>
                                $row
                                    ->badge_icon_key,
                            'styleKey' =>
                                $row
                                    ->badge_style_key,
                        ]
                        : null,
                'children' => [],
            ];
        }

        foreach ($rows as $row) {
            if (
                $row->parent_id
                && isset(
                    $items[
                        $row->parent_id
                    ],
                    $items[$row->id]
                )
            ) {
                $items[
                    $row->parent_id
                ]['children'][] =
                    $items[$row->id];
            }
        }

        foreach ($items as &$item) {
            usort(
                $item['children'],
                fn (
                    array $first,
                    array $second
                ): int =>
                    $first['sortOrder']
                    <=>
                    $second['sortOrder']
            );

            if (
                $item['type'] !== 'group'
                || count(
                    $item['children']
                ) === 0
            ) {
                continue;
            }

            $lockedChildren = array_values(
                array_filter(
                    $item['children'],
                    fn (array $child): bool =>
                        $child['lockReason']
                            !== null
                )
            );

            if (
                count($lockedChildren)
                !== count(
                    $item['children']
                )
            ) {
                continue;
            }

            $lockReasons = array_values(
                array_unique(
                    array_map(
                        fn (array $child): string =>
                            (string) $child[
                                'lockReason'
                            ],
                        $lockedChildren
                    )
                )
            );

            if (count($lockReasons) !== 1) {
                continue;
            }

            $item['lockReason'] =
                $lockReasons[0];

            $item['planLocked'] =
                $lockReasons[0] === 'plan';

            $item['subscriptionLocked'] =
                $lockReasons[0]
                    === 'subscription';

            $item['requiredPlan'] =
                collect($lockedChildren)
                    ->pluck(
                        'requiredPlan'
                    )
                    ->filter()
                    ->first();
        }

        unset($item);

        $sections = [];

        foreach ($rows as $row) {
            if (
                $row->parent_id !== null
            ) {
                continue;
            }

            $item = $items[$row->id];

            if (
                $item['type'] === 'group'
                && count(
                    $item['children']
                ) === 0
            ) {
                continue;
            }

            $sectionKey =
                $item['sectionKey'];

            if (
                ! isset(
                    $sections[
                        $sectionKey
                    ]
                )
            ) {
                $sections[$sectionKey] = [
                    'key' => $sectionKey,
                    'label' =>
                        Str::headline(
                            $sectionKey
                        ),
                    'sortOrder' =>
                        match (
                            $sectionKey
                        ) {
                            'overview' => 10,
                            'management' => 20,
                            'reports' => 30,
                            'settings' => 40,
                            default => 100,
                        },
                    'items' => [],
                ];
            }

            $sections[
                $sectionKey
            ]['items'][] = $item;
        }

        foreach (
            $sections as &$section
        ) {
            usort(
                $section['items'],
                fn (
                    array $first,
                    array $second
                ): int =>
                    $first['sortOrder']
                    <=>
                    $second['sortOrder']
            );
        }

        unset($section);

        uasort(
            $sections,
            fn (
                array $first,
                array $second
            ): int =>
                $first['sortOrder']
                <=>
                $second['sortOrder']
        );

        return array_values(
            $sections
        );
    }

    private function resolveUrl(
        object $row
    ): string {
        if ($row->url_override) {
            return $row->url_override;
        }

        if (
            $row->route_name
            && Route::has(
                $row->route_name
            )
        ) {
            return route(
                $row->route_name,
                [],
                false
            );
        }

        return '#';
    }

    private function subscriptionAccessMode(
        string $status
    ): string {
        if (
            in_array(
                $status,
                [
                    'active',
                    'trial',
                ],
                true
            )
        ) {
            return 'full';
        }

        if (
            in_array(
                $status,
                self::READ_ONLY_SUBSCRIPTION_STATUSES,
                true
            )
        ) {
            return 'read_only';
        }

        return 'blocked';
    }

    private function emptyPayload(
        ?object $product = null,
        ?object $access = null
    ): array {
        return [
            'product' =>
                $product
                    ? [
                        'id' =>
                            (int) $product->id,
                        'code' =>
                            $product
                                ->product_code,
                        'name' =>
                            $product->name,
                        'slug' =>
                            $product->slug,
                        'status' =>
                            $product->status,
                    ]
                    : null,
            'access' =>
                $access
                    ? [
                        'roleCode' =>
                            $access
                                ->type_code,
                        'roleName' =>
                            $access
                                ->user_type_name,
                        'accountOwnerId' =>
                            (int) $access
                                ->account_owner_id,
                    ]
                    : null,
            'subscription' => null,
            'sections' => [],
        ];
    }
}