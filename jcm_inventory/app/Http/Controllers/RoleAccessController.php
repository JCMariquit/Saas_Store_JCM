<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RoleAccessController extends Controller
{
    private const PRODUCT_CODE = 'JCM-INVENTORY-001';

    private const PROTECTED_ITEM_KEYS = [
        'team-overview',
        'team-group',
        'staff-accounts',
        'roles-access',
    ];

    private const REQUIRED_ITEM_KEYS = [
        'dashboard',
    ];

    public function index(Request $request): Response
    {
        $context = $this->ownerContext($request);

        $catalog = $this->permissionCatalog(
            productId: $context['product_id'],
            planId: $context['plan_id']
        );

        $roles = DB::connection('saas')
            ->table('product_user_types')
            ->join(
                'user_types',
                'user_types.id',
                '=',
                'product_user_types.user_type_id'
            )
            ->where(
                'product_user_types.product_id',
                $context['product_id']
            )
            ->where(
                'product_user_types.status',
                'active'
            )
            ->where(
                'user_types.status',
                'active'
            )
            ->where(
                'user_types.is_owner_type',
                false
            )
            ->orderBy('user_types.sort_order')
            ->get([
                'product_user_types.id',
                'product_user_types.display_name',
                'user_types.type_code',
                'user_types.name',
                'user_types.description',
                'user_types.sort_order',
            ]);

        $roleIds = $roles
            ->pluck('id')
            ->map(
                fn ($id): int => (int) $id
            )
            ->values();

        $assignments = $roleIds->isEmpty()
            ? collect()
            : DB::connection('saas')
                ->table(
                    'product_user_type_sidebar_items'
                )
                ->whereIn(
                    'product_user_type_id',
                    $roleIds
                )
                ->where(
                    'is_enabled',
                    true
                )
                ->get([
                    'product_user_type_id',
                    'sidebar_item_id',
                ])
                ->groupBy(
                    'product_user_type_id'
                );

        $memberCounts = $roleIds->isEmpty()
            ? collect()
            : DB::connection('saas')
                ->table('user_product_access')
                ->where(
                    'account_owner_id',
                    $context['owner_id']
                )
                ->where(
                    'product_id',
                    $context['product_id']
                )
                ->whereIn(
                    'product_user_type_id',
                    $roleIds
                )
                ->whereNot(
                    'status',
                    'removed'
                )
                ->selectRaw(
                    '
                    product_user_type_id,
                    COUNT(*) as members_count
                    '
                )
                ->groupBy(
                    'product_user_type_id'
                )
                ->pluck(
                    'members_count',
                    'product_user_type_id'
                );

        $assignableIds = $catalog[
            'assignable_link_ids'
        ];

        $requiredIds = $catalog[
            'required_link_ids'
        ];

        $formattedRoles = $roles
            ->map(
                function ($role) use (
                    $assignments,
                    $memberCounts,
                    $assignableIds,
                    $requiredIds
                ): array {
                    $roleAssignments = $assignments
                        ->get(
                            (int) $role->id,
                            collect()
                        )
                        ->pluck('sidebar_item_id')
                        ->map(
                            fn ($id): int => (int) $id
                        )
                        ->intersect($assignableIds)
                        ->merge($requiredIds)
                        ->unique()
                        ->sort()
                        ->values();

                    return [
                        'id' => (int) $role->id,

                        'code' => $role->type_code,

                        'name' =>
                            $role->display_name
                            ?: $role->name,

                        'description' =>
                            $role->description,

                        'members_count' =>
                            (int) (
                                $memberCounts->get(
                                    (int) $role->id
                                ) ?? 0
                            ),

                        'assigned_item_ids' =>
                            $roleAssignments->all(),

                        'enabled_count' =>
                            $roleAssignments->count(),

                        'available_count' =>
                            $assignableIds->count(),
                    ];
                }
            )
            ->values();

        $manager = $formattedRoles->firstWhere(
            'code',
            'manager'
        );

        $staff = $formattedRoles->firstWhere(
            'code',
            'staff'
        );

        return Inertia::render(
            'team-management/roles-access/index',
            [
                'roles' => $formattedRoles,

                'sections' =>
                    $catalog['sections'],

                'summary' => [
                    'roles' =>
                        $formattedRoles->count(),

                    'available_modules' =>
                        $assignableIds->count(),

                    'manager_access' =>
                        (int) (
                            $manager[
                                'enabled_count'
                            ] ?? 0
                        ),

                    'staff_access' =>
                        (int) (
                            $staff[
                                'enabled_count'
                            ] ?? 0
                        ),
                ],

                'plan' => [
                    'id' =>
                        $context['plan_id'],

                    'code' =>
                        $context['plan_code'],

                    'name' =>
                        $context['plan_name'],

                    'has_role_based_access' =>
                        $context[
                            'has_role_based_access'
                        ],
                ],
            ]
        );
    }

    public function update(
        Request $request,
        int $role
    ): RedirectResponse {
        $context = $this->ownerContext($request);

        $productRole = $this->findAssignableRole(
            productId: $context['product_id'],
            productUserTypeId: $role
        );

        $catalog = $this->permissionCatalog(
            productId: $context['product_id'],
            planId: $context['plan_id']
        );

        $validated = $request->validate([
            'sidebar_item_ids' => [
                'present',
                'array',
            ],

            'sidebar_item_ids.*' => [
                'integer',
                'distinct',
            ],
        ]);

        $requestedIds = collect(
            $validated['sidebar_item_ids']
        )
            ->map(
                fn ($id): int => (int) $id
            )
            ->unique()
            ->values();

        $invalidIds = $requestedIds->diff(
            $catalog['assignable_link_ids']
        );

        if ($invalidIds->isNotEmpty()) {
            throw ValidationException::withMessages([
                'sidebar_item_ids' =>
                    'One or more selected modules are unavailable.',
            ]);
        }

        $selectedLinkIds = $requestedIds
            ->intersect(
                $catalog[
                    'assignable_link_ids'
                ]
            )
            ->merge(
                $catalog[
                    'required_link_ids'
                ]
            )
            ->unique()
            ->values();

        $selectedItemIds = $this
            ->includeParentItems(
                selectedIds: $selectedLinkIds,
                parentMap: $catalog['parent_map']
            );

        DB::connection('saas')->transaction(
            function () use (
                $role,
                $catalog,
                $selectedItemIds
            ): void {
                DB::connection('saas')
                    ->table(
                        'product_user_type_sidebar_items'
                    )
                    ->where(
                        'product_user_type_id',
                        $role
                    )
                    ->whereIn(
                        'sidebar_item_id',
                        $catalog[
                            'managed_item_ids'
                        ]
                    )
                    ->delete();

                if ($selectedItemIds->isEmpty()) {
                    return;
                }

                $now = now();

                $records = $selectedItemIds
                    ->map(
                        fn (int $sidebarItemId): array => [
                            'product_user_type_id' =>
                                $role,

                            'sidebar_item_id' =>
                                $sidebarItemId,

                            'is_enabled' => true,

                            'created_at' => $now,
                            'updated_at' => $now,
                        ]
                    )
                    ->all();

                DB::connection('saas')
                    ->table(
                        'product_user_type_sidebar_items'
                    )
                    ->insert($records);
            }
        );

        $roleName =
            $productRole->display_name
            ?: $productRole->name;

        return back()->with(
            'success',
            "{$roleName} access updated successfully."
        );
    }

    private function permissionCatalog(
        int $productId,
        int $planId
    ): array {
        $items = DB::connection('saas')
            ->table('sidebar_items as item')
            ->leftJoin(
                'app_features as feature',
                'feature.id',
                '=',
                'item.feature_id'
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
                            'item.feature_id'
                        )
                        ->where(
                            'plan_feature.plan_id',
                            $planId
                        );
                }
            )
            ->where(
                'item.product_id',
                $productId
            )
            ->where(
                'item.status',
                'active'
            )
            ->where(
                'item.is_visible',
                true
            )
            ->where(
                'item.is_developer_ready',
                true
            )
            ->whereNotIn(
                'item.item_key',
                self::PROTECTED_ITEM_KEYS
            )
            ->where(
                function ($query): void {
                    $query
                        ->whereNull(
                            'item.feature_id'
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
                                    ->where(
                                        'feature.is_developer_ready',
                                        true
                                    )
                                    ->where(
                                        'plan_feature.is_enabled',
                                        true
                                    );
                            }
                        );
                }
            )
            ->orderBy('item.section_key')
            ->orderBy('item.sort_order')
            ->orderBy('item.id')
            ->get([
                'item.id',
                'item.parent_id',
                'item.feature_id',
                'item.item_key',
                'item.section_key',
                'item.item_type',
                'item.label',
                'item.route_name',
                'item.url_override',
                'item.icon_key',
                'item.sort_order',

                'feature.feature_code',
                'feature.name as feature_name',
                'feature.description as feature_description',
            ]);

        $itemsById = $items->keyBy(
            fn ($item): int => (int) $item->id
        );

        $childrenByParent = $items
            ->filter(
                fn ($item): bool =>
                    $item->parent_id !== null
            )
            ->groupBy(
                fn ($item): int =>
                    (int) $item->parent_id
            );

        $topLevelItems = $items
            ->filter(
                fn ($item): bool =>
                    $item->parent_id === null
            );

        $formattedTopLevel = $topLevelItems
            ->map(
                function ($item) use (
                    $childrenByParent
                ): ?array {
                    return $this->formatSidebarItem(
                        item: $item,
                        childrenByParent:
                            $childrenByParent
                    );
                }
            )
            ->filter()
            ->values();

        $sections = $formattedTopLevel
            ->groupBy('section_key')
            ->map(
                function (
                    Collection $sectionItems,
                    string $sectionKey
                ): array {
                    return [
                        'key' => $sectionKey,

                        'label' =>
                            $this->sectionLabel(
                                $sectionKey
                            ),

                        'items' =>
                            $sectionItems
                                ->values()
                                ->all(),
                    ];
                }
            )
            ->values()
            ->all();

        $assignableLinks = $items
            ->where(
                'item_type',
                'link'
            )
            ->values();

        $assignableLinkIds = $assignableLinks
            ->pluck('id')
            ->map(
                fn ($id): int => (int) $id
            )
            ->unique()
            ->values();

        $requiredLinkIds = $assignableLinks
            ->whereIn(
                'item_key',
                self::REQUIRED_ITEM_KEYS
            )
            ->pluck('id')
            ->map(
                fn ($id): int => (int) $id
            )
            ->unique()
            ->values();

        $parentMap = $itemsById
            ->mapWithKeys(
                fn ($item): array => [
                    (int) $item->id =>
                        $item->parent_id !== null
                            ? (int) $item->parent_id
                            : null,
                ]
            );

        $managedItemIds = $this
            ->includeParentItems(
                selectedIds: $assignableLinkIds,
                parentMap: $parentMap
            )
            ->values();

        return [
            'sections' => $sections,

            'assignable_link_ids' =>
                $assignableLinkIds,

            'required_link_ids' =>
                $requiredLinkIds,

            'parent_map' => $parentMap,

            'managed_item_ids' =>
                $managedItemIds,
        ];
    }

    private function formatSidebarItem(
        object $item,
        Collection $childrenByParent
    ): ?array {
        $children = $childrenByParent
            ->get(
                (int) $item->id,
                collect()
            )
            ->map(
                function ($child) use (
                    $childrenByParent
                ): ?array {
                    return $this->formatSidebarItem(
                        item: $child,
                        childrenByParent:
                            $childrenByParent
                    );
                }
            )
            ->filter()
            ->values();

        if (
            $item->item_type === 'group'
            && $children->isEmpty()
        ) {
            return null;
        }

        return [
            'id' => (int) $item->id,

            'parent_id' =>
                $item->parent_id !== null
                    ? (int) $item->parent_id
                    : null,

            'key' => $item->item_key,

            'section_key' =>
                $item->section_key,

            'type' => $item->item_type,

            'label' => $item->label,

            'route_name' =>
                $item->route_name,

            'url' =>
                $item->url_override
                ?: '#',

            'icon_key' =>
                $item->icon_key,

            'feature_code' =>
                $item->feature_code,

            'description' =>
                $item->feature_description,

            'required' => in_array(
                $item->item_key,
                self::REQUIRED_ITEM_KEYS,
                true
            ),

            'assignable' =>
                $item->item_type === 'link',

            'children' => $children->all(),
        ];
    }

    private function includeParentItems(
        Collection $selectedIds,
        Collection $parentMap
    ): Collection {
        $result = $selectedIds
            ->map(
                fn ($id): int => (int) $id
            )
            ->unique()
            ->values();

        foreach ($selectedIds as $selectedId) {
            $parentId = $parentMap->get(
                (int) $selectedId
            );

            $visited = [];

            while ($parentId !== null) {
                if (
                    in_array(
                        $parentId,
                        $visited,
                        true
                    )
                ) {
                    break;
                }

                $visited[] = $parentId;

                $result->push(
                    (int) $parentId
                );

                $parentId = $parentMap->get(
                    (int) $parentId
                );
            }
        }

        return $result
            ->unique()
            ->sort()
            ->values();
    }

    private function findAssignableRole(
        int $productId,
        int $productUserTypeId
    ): object {
        $role = DB::connection('saas')
            ->table('product_user_types')
            ->join(
                'user_types',
                'user_types.id',
                '=',
                'product_user_types.user_type_id'
            )
            ->where(
                'product_user_types.id',
                $productUserTypeId
            )
            ->where(
                'product_user_types.product_id',
                $productId
            )
            ->where(
                'product_user_types.status',
                'active'
            )
            ->where(
                'user_types.status',
                'active'
            )
            ->where(
                'user_types.is_owner_type',
                false
            )
            ->first([
                'product_user_types.id',
                'product_user_types.display_name',
                'user_types.type_code',
                'user_types.name',
            ]);

        if (! $role) {
            throw ValidationException::withMessages([
                'role' =>
                    'The selected role is unavailable.',
            ]);
        }

        return $role;
    }

    private function ownerContext(
        Request $request
    ): array {
        $userId = (int) $request->user()->id;

        $context = DB::connection('saas')
            ->table('user_product_access as access')
            ->join(
                'products',
                'products.id',
                '=',
                'access.product_id'
            )
            ->join(
                'product_user_types',
                'product_user_types.id',
                '=',
                'access.product_user_type_id'
            )
            ->join(
                'user_types',
                'user_types.id',
                '=',
                'product_user_types.user_type_id'
            )
            ->join(
                'subscriptions',
                'subscriptions.id',
                '=',
                'access.subscription_id'
            )
            ->join(
                'plans',
                'plans.id',
                '=',
                'subscriptions.plan_id'
            )
            ->where(
                'access.user_id',
                $userId
            )
            ->where(
                'access.account_owner_id',
                $userId
            )
            ->where(
                'products.product_code',
                self::PRODUCT_CODE
            )
            ->where(
                'access.status',
                'active'
            )
            ->where(
                'user_types.is_owner_type',
                true
            )
            ->whereIn(
                'subscriptions.status',
                [
                    'trial',
                    'active',
                ]
            )
            ->first([
                'access.account_owner_id',
                'access.product_id',
                'access.subscription_id',

                'products.name as product_name',

                'plans.id as plan_id',
                'plans.plan_code',
                'plans.plan_name',
                'plans.has_role_based_access',
            ]);

        abort_if(
            ! $context,
            403,
            'Only the account owner can manage role access.'
        );

        abort_if(
            ! (bool) $context
                ->has_role_based_access,
            403,
            'Your current plan does not include role-based access.'
        );

        return [
            'owner_id' =>
                (int) $context
                    ->account_owner_id,

            'product_id' =>
                (int) $context->product_id,

            'subscription_id' =>
                (int) $context
                    ->subscription_id,

            'plan_id' =>
                (int) $context->plan_id,

            'plan_code' =>
                $context->plan_code,

            'plan_name' =>
                $context->plan_name,

            'has_role_based_access' =>
                (bool) $context
                    ->has_role_based_access,
        ];
    }

    private function sectionLabel(
        string $sectionKey
    ): string {
        return match ($sectionKey) {
            'overview' => 'Overview',
            'management' => 'Management',
            default => Str::headline(
                $sectionKey
            ),
        };
    }
}