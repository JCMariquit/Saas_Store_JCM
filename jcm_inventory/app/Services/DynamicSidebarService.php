<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;

final class DynamicSidebarService
{
    /**
     * Build the sidebar visible to one user inside one JCM SaaS product.
     *
     * Visibility rules:
     * - user has active product access
     * - subscription is active or trial
     * - sidebar item is assigned to the user's product role
     * - feature is included in the subscription plan
     * - sidebar record is active and visible
     *
     * Items that are not developer-ready are returned as disabled so their
     * SOON/DEV/etc. badge can still be displayed.
     */
    public function forUser(User $user, string $productCode): array
    {
        $product = DB::connection('saas')->table('products')
            ->where('product_code', $productCode)
            ->whereIn('status', [
                'development',
                'active',
                'maintenance',
                'paused',
            ])
            ->first([
                'id',
                'product_code',
                'name',
                'slug',
                'status',
            ]);

        if (! $product) {
            return $this->emptyPayload();
        }

        $access = DB::connection('saas')->table('user_product_access as upa')
            ->join(
                'product_user_types as put',
                'put.id',
                '=',
                'upa.product_user_type_id'
            )
            ->join(
                'user_types as ut',
                'ut.id',
                '=',
                'put.user_type_id'
            )
            ->leftJoin('user_product_access as owner_access', function ($join) {
                $join->on(
                    'owner_access.user_id',
                    '=',
                    'upa.account_owner_id'
                )
                    ->on(
                        'owner_access.product_id',
                        '=',
                        'upa.product_id'
                    )
                    ->on(
                        'owner_access.account_owner_id',
                        '=',
                        'upa.account_owner_id'
                    )
                    ->where('owner_access.status', '=', 'active');
            })
            ->where('upa.user_id', $user->id)
            ->where('upa.product_id', $product->id)
            ->where('upa.status', 'active')
            ->where('put.status', 'active')
            ->where('ut.status', 'active')
            ->select([
                'upa.id',
                'upa.user_id',
                'upa.product_id',
                'upa.product_user_type_id',
                'upa.account_owner_id',
                'ut.type_code',
                'ut.name as user_type_name',
                DB::raw(
                    'COALESCE(
                        upa.subscription_id,
                        owner_access.subscription_id
                    ) as resolved_subscription_id'
                ),
            ])
            ->first();

        if (! $access) {
            return $this->emptyPayload($product);
        }

        $subscription = $this->resolveSubscription(
            $access,
            $product->id
        );

        if (! $subscription) {
            return $this->emptyPayload($product, $access);
        }

        $rows = DB::connection('saas')->table('sidebar_items as si')
            ->join(
                'product_user_type_sidebar_items as role_sidebar',
                function ($join) use ($access) {
                    $join->on(
                        'role_sidebar.sidebar_item_id',
                        '=',
                        'si.id'
                    )
                        ->where(
                            'role_sidebar.product_user_type_id',
                            '=',
                            $access->product_user_type_id
                        )
                        ->where(
                            'role_sidebar.is_enabled',
                            '=',
                            1
                        );
                }
            )
            ->leftJoin(
                'app_features as af',
                'af.id',
                '=',
                'si.feature_id'
            )
            ->leftJoin('plan_features as pf', function ($join) use ($subscription) {
                $join->on(
                    'pf.feature_id',
                    '=',
                    'si.feature_id'
                )
                    ->where(
                        'pf.plan_id',
                        '=',
                        $subscription->plan_id
                    )
                    ->where(
                        'pf.is_enabled',
                        '=',
                        1
                    );
            })
            ->leftJoin(
                'sidebar_badges as sb',
                'sb.id',
                '=',
                'si.badge_id'
            )
            ->where('si.product_id', $product->id)
            ->where('si.status', 'active')
            ->where('si.is_visible', 1)
            ->where(function ($query) {
                $query
                    ->whereNull('si.feature_id')
                    ->orWhere(function ($featureQuery) {
                        $featureQuery
                            ->where('af.status', 'active')
                            ->whereNotNull('pf.id');
                    });
            })
            ->orderByRaw(
                "CASE si.section_key
                    WHEN 'overview' THEN 10
                    WHEN 'management' THEN 20
                    ELSE 100
                END"
            )
            ->orderBy('si.sort_order')
            ->orderBy('si.id')
            ->get([
                'si.id',
                'si.parent_id',
                'si.item_key',
                'si.section_key',
                'si.item_type',
                'si.label',
                'si.route_name',
                'si.url_override',
                'si.icon_key',
                'si.sort_order',
                'si.is_developer_ready',
                DB::raw(
                    'COALESCE(sb.badge_code, si.badge) as badge_code'
                ),
                'sb.name as badge_name',
                'sb.icon_key as badge_icon_key',
                'sb.style_key as badge_style_key',
            ]);

        return [
            'product' => [
                'id' => (int) $product->id,
                'code' => $product->product_code,
                'name' => $product->name,
                'slug' => $product->slug,
                'status' => $product->status,
            ],
            'access' => [
                'roleCode' => $access->type_code,
                'roleName' => $access->user_type_name,
                'accountOwnerId' => (int) $access->account_owner_id,
            ],
            'subscription' => [
                'id' => (int) $subscription->id,
                'planId' => (int) $subscription->plan_id,
                'status' => $subscription->status,
                'endDate' => $subscription->end_date,
            ],
            'sections' => $this->buildSections($rows),
        ];
    }

    /**
     * Check whether the user can directly access a feature route.
     */
    public function canAccessFeature(
        User $user,
        string $productCode,
        string $featureCode
    ): bool {
        $saas = DB::connection('saas');

        /*
        |--------------------------------------------------------------------------
        | Product
        |--------------------------------------------------------------------------
        */

        $product = $saas
            ->table('products')
            ->where('product_code', $productCode)
            ->whereIn('status', [
                'development',
                'active',
                'maintenance',
                'paused',
            ])
            ->first([
                'id',
            ]);

        if (! $product) {
            return false;
        }

        /*
        |--------------------------------------------------------------------------
        | User product access and product role
        |--------------------------------------------------------------------------
        */

        $access = $saas
            ->table('user_product_access as upa')
            ->join(
                'product_user_types as put',
                'put.id',
                '=',
                'upa.product_user_type_id'
            )
            ->join(
                'user_types as ut',
                'ut.id',
                '=',
                'put.user_type_id'
            )
            ->leftJoin(
                'user_product_access as owner_access',
                function ($join) {
                    $join
                        ->on(
                            'owner_access.user_id',
                            '=',
                            'upa.account_owner_id'
                        )
                        ->on(
                            'owner_access.product_id',
                            '=',
                            'upa.product_id'
                        )
                        ->on(
                            'owner_access.account_owner_id',
                            '=',
                            'upa.account_owner_id'
                        )
                        ->where(
                            'owner_access.status',
                            '=',
                            'active'
                        );
                }
            )
            ->where('upa.user_id', $user->id)
            ->where('upa.product_id', $product->id)
            ->where('upa.status', 'active')
            ->where('put.status', 'active')
            ->where('ut.status', 'active')
            ->first([
                'upa.product_user_type_id',
                'upa.account_owner_id',

                DB::raw(
                    'COALESCE(
                        upa.subscription_id,
                        owner_access.subscription_id
                    ) as resolved_subscription_id'
                ),
            ]);

        if (! $access) {
            return false;
        }

        /*
        |--------------------------------------------------------------------------
        | Active subscription
        |--------------------------------------------------------------------------
        */

        $subscriptionQuery = $saas
            ->table('subscriptions')
            ->where('product_id', $product->id)
            ->whereIn('status', [
                'active',
                'trial',
            ])
            ->where(function ($query) {
                $query
                    ->whereNull('end_date')
                    ->orWhereDate(
                        'end_date',
                        '>=',
                        now()->toDateString()
                    );
            });

        $subscription = null;

        if ($access->resolved_subscription_id) {
            $subscription = (clone $subscriptionQuery)
                ->where(
                    'id',
                    $access->resolved_subscription_id
                )
                ->first([
                    'id',
                    'plan_id',
                ]);
        }

        /*
        * Staff and manager may use the owner's subscription.
        */
        if (! $subscription) {
            $subscription = $subscriptionQuery
                ->where(
                    'user_id',
                    $access->account_owner_id
                )
                ->latest('id')
                ->first([
                    'id',
                    'plan_id',
                ]);
        }

        if (! $subscription || ! $subscription->plan_id) {
            return false;
        }

        /*
        |--------------------------------------------------------------------------
        | Final feature permission
        |--------------------------------------------------------------------------
        |
        | Must be:
        | - active feature
        | - included in the plan
        | - assigned to the user's product role
        | - connected to a developer-ready sidebar/page record
        |
        */

        return $saas
            ->table('app_features as af')
            ->join(
                'plan_features as pf',
                function ($join) use ($subscription) {
                    $join
                        ->on(
                            'pf.feature_id',
                            '=',
                            'af.id'
                        )
                        ->where(
                            'pf.plan_id',
                            '=',
                            $subscription->plan_id
                        )
                        ->where(
                            'pf.is_enabled',
                            '=',
                            1
                        );
                }
            )
            ->join(
                'sidebar_items as si',
                function ($join) use ($product) {
                    $join
                        ->on(
                            'si.feature_id',
                            '=',
                            'af.id'
                        )
                        ->where(
                            'si.product_id',
                            '=',
                            $product->id
                        );
                }
            )
            ->join(
                'product_user_type_sidebar_items as role_sidebar',
                function ($join) use ($access) {
                    $join
                        ->on(
                            'role_sidebar.sidebar_item_id',
                            '=',
                            'si.id'
                        )
                        ->where(
                            'role_sidebar.product_user_type_id',
                            '=',
                            $access->product_user_type_id
                        )
                        ->where(
                            'role_sidebar.is_enabled',
                            '=',
                            1
                        );
                }
            )
            ->where('af.product_id', $product->id)
            ->where('af.feature_code', $featureCode)
            ->where('af.status', 'active')
            ->where('si.status', 'active')
            ->where('si.is_developer_ready', 1)
            ->exists();
    }

    private function resolveSubscription(
        object $access,
        int $productId
    ): ?object {
        $query = DB::connection('saas')->table('subscriptions')
            ->where('product_id', $productId)
            ->whereIn('status', ['active', 'trial']);

        if ($access->resolved_subscription_id) {
            $subscription = (clone $query)
                ->where('id', $access->resolved_subscription_id)
                ->first([
                    'id',
                    'plan_id',
                    'status',
                    'end_date',
                ]);

            if ($subscription) {
                return $subscription;
            }
        }

        return $query
            ->where('user_id', $access->account_owner_id)
            ->latest('id')
            ->first([
                'id',
                'plan_id',
                'status',
                'end_date',
            ]);
    }

    private function buildSections($rows): array
    {
        $items = [];

        foreach ($rows as $row) {
            $url = $this->resolveUrl($row);

            $items[$row->id] = [
                'id' => (int) $row->id,
                'key' => $row->item_key,
                'sectionKey' => $row->section_key,
                'type' => $row->item_type,
                'title' => $row->label,
                'url' => $url,
                'iconKey' => $row->icon_key,
                'disabled' => $row->item_type === 'link'
                    && (
                        ! (bool) $row->is_developer_ready
                        || $url === '#'
                    ),
                'sortOrder' => (int) $row->sort_order,
                'badge' => $row->badge_code
                    ? [
                        'code' => $row->badge_code,
                        'name' => $row->badge_name
                            ?: $row->badge_code,
                        'iconKey' => $row->badge_icon_key,
                        'styleKey' => $row->badge_style_key,
                    ]
                    : null,
                'children' => [],
            ];
        }

        foreach ($rows as $row) {
            if (
                $row->parent_id
                && isset($items[$row->parent_id], $items[$row->id])
            ) {
                $items[$row->parent_id]['children'][] =
                    $items[$row->id];
            }
        }

        foreach ($items as &$item) {
            usort(
                $item['children'],
                fn (array $a, array $b): int =>
                    $a['sortOrder'] <=> $b['sortOrder']
            );
        }
        unset($item);

        $sections = [];

        foreach ($rows as $row) {
            if ($row->parent_id !== null) {
                continue;
            }

            $item = $items[$row->id];

            // Do not display an empty group.
            if (
                $item['type'] === 'group'
                && count($item['children']) === 0
            ) {
                continue;
            }

            $sectionKey = $item['sectionKey'];

            if (! isset($sections[$sectionKey])) {
                $sections[$sectionKey] = [
                    'key' => $sectionKey,
                    'label' => Str::headline($sectionKey),
                    'sortOrder' => match ($sectionKey) {
                        'overview' => 10,
                        'management' => 20,
                        default => 100,
                    },
                    'items' => [],
                ];
            }

            $sections[$sectionKey]['items'][] = $item;
        }

        foreach ($sections as &$section) {
            usort(
                $section['items'],
                fn (array $a, array $b): int =>
                    $a['sortOrder'] <=> $b['sortOrder']
            );
        }
        unset($section);

        uasort(
            $sections,
            fn (array $a, array $b): int =>
                $a['sortOrder'] <=> $b['sortOrder']
        );

        return array_values($sections);
    }

    private function resolveUrl(object $row): string
    {
        if ($row->url_override) {
            return $row->url_override;
        }

        if (
            $row->route_name
            && Route::has($row->route_name)
        ) {
            return route($row->route_name, [], false);
        }

        return '#';
    }

    private function emptyPayload(
        ?object $product = null,
        ?object $access = null
    ): array {
        return [
            'product' => $product
                ? [
                    'id' => (int) $product->id,
                    'code' => $product->product_code,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'status' => $product->status,
                ]
                : null,
            'access' => $access
                ? [
                    'roleCode' => $access->type_code,
                    'roleName' => $access->user_type_name,
                    'accountOwnerId' =>
                        (int) $access->account_owner_id,
                ]
                : null,
            'subscription' => null,
            'sections' => [],
        ];
    }
}