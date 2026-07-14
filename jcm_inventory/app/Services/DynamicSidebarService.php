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

        return $this->payload(
            $product,
            $access,
            $subscription,
            $rows
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
                'subscription.user_id',
                $access->account_owner_id
            )
            ->whereIn(
                'subscription.status',
                [
                    'active',
                    'trial',
                ]
            )
            ->where(
                'plan.status',
                'active'
            )
            ->where(
                function ($query): void {
                    $query
                        ->whereNull(
                            'subscription.end_date'
                        )
                        ->orWhereDate(
                            'subscription.end_date',
                            '>=',
                            now()->toDateString()
                        );
                }
            );

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
                    ->first([
                        'subscription.id',
                        'subscription.plan_id',
                        'subscription.status',
                        'subscription.end_date',
                    ]);

            if ($subscription) {
                return $subscription;
            }
        }

        return $query
            ->orderByDesc(
                'subscription.id'
            )
            ->first([
                'subscription.id',
                'subscription.plan_id',
                'subscription.status',
                'subscription.end_date',
            ]);
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
                            function (
                                $featureQuery
                            ): void {
                                $featureQuery
                                    ->where(
                                        'feature.status',
                                        'active'
                                    )
                                    ->whereNotNull(
                                        'plan_feature.id'
                                    );
                            }
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
                'sidebar.item_key',
                'sidebar.section_key',
                'sidebar.item_type',
                'sidebar.label',
                'sidebar.route_name',
                'sidebar.url_override',
                'sidebar.icon_key',
                'sidebar.sort_order',
                'sidebar.is_developer_ready',
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

    private function payload(
        object $product,
        object $access,
        object $subscription,
        Collection $rows
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
                'status' =>
                    $subscription->status,
                'endDate' =>
                    $subscription->end_date,
            ],
            'sections' =>
                $this->buildSections(
                    $rows
                ),
        ];
    }

    private function buildSections(
        Collection $rows
    ): array {
        $items = [];

        foreach ($rows as $row) {
            $url = $this->resolveUrl(
                $row
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
                'disabled' =>
                    $row->item_type
                        === 'link'
                    && (
                        ! (bool) $row
                            ->is_developer_ready
                        || $url === '#'
                    ),
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