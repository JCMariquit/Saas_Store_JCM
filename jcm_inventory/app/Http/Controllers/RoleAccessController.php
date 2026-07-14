<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
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
        $catalog = $this->permissionCatalog($context);

        $roles = DB::connection('saas')
            ->table('product_user_types as product_role')
            ->join(
                'user_types as user_type',
                'user_type.id',
                '=',
                'product_role.user_type_id'
            )
            ->where(
                'product_role.product_id',
                $context['product_id']
            )
            ->where(
                'product_role.status',
                'active'
            )
            ->where(
                'user_type.status',
                'active'
            )
            ->where(
                'user_type.is_owner_type',
                0
            )
            ->orderBy('user_type.sort_order')
            ->select([
                'product_role.id',
                'product_role.display_name',
                'user_type.type_code',
                'user_type.name',
                'user_type.description',
            ])
            ->get()
            ->map(function ($role) use (
                $context,
                $catalog
            ): array {
                $assignedItemIds =
                    $this->assignedItemIds(
                        $context,
                        (int) $role->id,
                        $catalog['assignable_ids']
                    );

                $membersCount = DB::connection('saas')
                    ->table('user_product_access')
                    ->where(
                        'account_owner_id',
                        $context['account_owner_id']
                    )
                    ->where(
                        'product_id',
                        $context['product_id']
                    )
                    ->where(
                        'product_user_type_id',
                        $role->id
                    )
                    ->where(
                        'status',
                        'active'
                    )
                    ->count();

                return [
                    'id' => (int) $role->id,
                    'code' => (string) $role->type_code,
                    'name' => (string) (
                        $role->display_name
                        ?: $role->name
                    ),
                    'description' =>
                        $role->description,
                    'members_count' =>
                        (int) $membersCount,
                    'assigned_item_ids' =>
                        $assignedItemIds,
                    'enabled_count' =>
                        count($assignedItemIds),
                    'available_count' =>
                        count(
                            $catalog[
                                'assignable_ids'
                            ]
                        ),
                ];
            })
            ->values();

        $managerAccess = $roles
            ->firstWhere('code', 'manager');

        $staffAccess = $roles
            ->firstWhere('code', 'staff');

        return Inertia::render(
            'team-management/roles-access/index',
            [
                'roles' => $roles,
                'sections' =>
                    $catalog['sections'],
                'summary' => [
                    'roles' => $roles->count(),
                    'available_modules' => count(
                        $catalog['assignable_ids']
                    ),
                    'manager_access' => (int) (
                        $managerAccess[
                            'enabled_count'
                        ] ?? 0
                    ),
                    'staff_access' => (int) (
                        $staffAccess[
                            'enabled_count'
                        ] ?? 0
                    ),
                ],
                'plan' => [
                    'id' => $context['plan_id'],
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

        abort_unless(
            $context['has_role_based_access'],
            403,
            'Role-based access is not included in your current plan.'
        );

        $productRole = $this->findAssignableRole(
            $context['product_id'],
            $role
        );

        abort_unless(
            $productRole,
            404,
            'The selected role was not found.'
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

        $catalog = $this->permissionCatalog(
            $context
        );

        $requestedIds = collect(
            $validated['sidebar_item_ids']
        )
            ->map(
                fn ($id): int => (int) $id
            )
            ->unique()
            ->values();

        $availableIds = collect(
            $catalog['assignable_ids']
        );

        $invalidIds = $requestedIds->diff(
            $availableIds
        );

        if ($invalidIds->isNotEmpty()) {
            throw ValidationException::withMessages([
                'sidebar_item_ids' =>
                    'One or more selected modules are unavailable for your current plan.',
            ]);
        }

        $selectedIds = $requestedIds
            ->merge(
                $catalog['required_ids']
            )
            ->unique()
            ->values();

        $storedIds = $this->includeParentItems(
            $selectedIds,
            $catalog['parent_map']
        );

        $connection = DB::connection('saas');

        $connection->transaction(
            function () use (
                $connection,
                $context,
                $productRole,
                $storedIds,
                $request
            ): void {
                $connection
                    ->table(
                        'account_role_sidebar_items'
                    )
                    ->where(
                        'account_owner_id',
                        $context[
                            'account_owner_id'
                        ]
                    )
                    ->where(
                        'product_id',
                        $context['product_id']
                    )
                    ->where(
                        'product_user_type_id',
                        $productRole->id
                    )
                    ->delete();

                if ($storedIds->isEmpty()) {
                    return;
                }

                $now = now();
                $assignedBy = (int) (
                    $request->user()?->id
                );

                $rows = $storedIds
                    ->map(
                        function (
                            int $sidebarItemId
                        ) use (
                            $context,
                            $productRole,
                            $assignedBy,
                            $now
                        ): array {
                            return [
                                'account_owner_id' =>
                                    $context[
                                        'account_owner_id'
                                    ],
                                'product_id' =>
                                    $context[
                                        'product_id'
                                    ],
                                'product_user_type_id' =>
                                    (int) $productRole->id,
                                'sidebar_item_id' =>
                                    $sidebarItemId,
                                'is_enabled' => 1,
                                'assigned_by' =>
                                    $assignedBy,
                                'created_at' => $now,
                                'updated_at' => $now,
                            ];
                        }
                    )
                    ->all();

                $connection
                    ->table(
                        'account_role_sidebar_items'
                    )
                    ->insert($rows);
            }
        );

        return back()->with(
            'success',
            $productRole->display_name
                .' permissions updated successfully.'
        );
    }

    private function ownerContext(
        Request $request
    ): array {
        $userId = (int) (
            $request->user()?->id
        );

        abort_unless(
            $userId > 0,
            401
        );

        $context = DB::connection('saas')
            ->table(
                'user_product_access as access'
            )
            ->join(
                'products as product',
                'product.id',
                '=',
                'access.product_id'
            )
            ->join(
                'product_user_types as owner_role',
                function ($join): void {
                    $join
                        ->on(
                            'owner_role.id',
                            '=',
                            'access.product_user_type_id'
                        )
                        ->on(
                            'owner_role.product_id',
                            '=',
                            'access.product_id'
                        );
                }
            )
            ->join(
                'user_types as owner_type',
                'owner_type.id',
                '=',
                'owner_role.user_type_id'
            )
            ->join(
                'subscriptions as subscription',
                function ($join): void {
                    $join
                        ->on(
                            'subscription.id',
                            '=',
                            'access.subscription_id'
                        )
                        ->on(
                            'subscription.product_id',
                            '=',
                            'access.product_id'
                        );
                }
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
                'access.user_id',
                $userId
            )
            ->where(
                'access.account_owner_id',
                $userId
            )
            ->where(
                'access.status',
                'active'
            )
            ->where(
                'product.product_code',
                self::PRODUCT_CODE
            )
            ->whereIn(
                'product.status',
                [
                    'development',
                    'active',
                ]
            )
            ->where(
                'owner_role.status',
                'active'
            )
            ->where(
                'owner_type.status',
                'active'
            )
            ->where(
                'owner_type.is_owner_type',
                1
            )
            ->whereIn(
                'subscription.status',
                [
                    'trial',
                    'active',
                ]
            )
            ->where(
                'plan.status',
                'active'
            )
            ->orderByDesc(
                'subscription.id'
            )
            ->select([
                'access.account_owner_id',
                'access.product_id',
                'access.subscription_id',
                'product.product_code',
                'plan.id as plan_id',
                'plan.plan_code',
                'plan.plan_name',
                'plan.has_role_based_access',
            ])
            ->first();

        abort_unless(
            $context,
            403,
            'Only the account owner can manage role permissions.'
        );

        return [
            'account_owner_id' => (int) (
                $context->account_owner_id
            ),
            'product_id' => (int) (
                $context->product_id
            ),
            'subscription_id' => (int) (
                $context->subscription_id
            ),
            'product_code' => (string) (
                $context->product_code
            ),
            'plan_id' => (int) (
                $context->plan_id
            ),
            'plan_code' => (string) (
                $context->plan_code
            ),
            'plan_name' => (string) (
                $context->plan_name
            ),
            'has_role_based_access' =>
                (bool) (
                    $context
                        ->has_role_based_access
                ),
        ];
    }

    private function permissionCatalog(
        array $context
    ): array {
        $enabledFeatureIds = DB::connection(
            'saas'
        )
            ->table(
                'plan_features as plan_feature'
            )
            ->join(
                'app_features as feature',
                function ($join): void {
                    $join
                        ->on(
                            'feature.id',
                            '=',
                            'plan_feature.feature_id'
                        );
                }
            )
            ->where(
                'plan_feature.plan_id',
                $context['plan_id']
            )
            ->where(
                'plan_feature.is_enabled',
                1
            )
            ->where(
                'feature.product_id',
                $context['product_id']
            )
            ->where(
                'feature.status',
                'active'
            )
            ->where(
                'feature.is_developer_ready',
                1
            )
            ->pluck('feature.id')
            ->map(
                fn ($id): int => (int) $id
            )
            ->values();

        $rows = DB::connection('saas')
            ->table('sidebar_items as sidebar')
            ->leftJoin(
                'app_features as feature',
                'feature.id',
                '=',
                'sidebar.feature_id'
            )
            ->where(
                'sidebar.product_id',
                $context['product_id']
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
            ->whereNotIn(
                'sidebar.item_key',
                self::PROTECTED_ITEM_KEYS
            )
            ->where(
                function ($query) use (
                    $enabledFeatureIds
                ): void {
                    $query->whereNull(
                        'sidebar.feature_id'
                    );

                    if (
                        $enabledFeatureIds
                            ->isNotEmpty()
                    ) {
                        $query->orWhereIn(
                            'sidebar.feature_id',
                            $enabledFeatureIds
                        );
                    }
                }
            )
            ->orderBy(
                'sidebar.section_key'
            )
            ->orderBy(
                'sidebar.sort_order'
            )
            ->orderBy(
                'sidebar.id'
            )
            ->select([
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
                'feature.feature_code',
                'feature.description',
            ])
            ->get();

        $assignableIds = $rows
            ->filter(
                fn ($row): bool =>
                    $row->item_type === 'link'
            )
            ->pluck('id')
            ->map(
                fn ($id): int => (int) $id
            )
            ->values()
            ->all();

        $requiredIds = $rows
            ->filter(
                fn ($row): bool =>
                    in_array(
                        $row->item_key,
                        self::REQUIRED_ITEM_KEYS,
                        true
                    )
            )
            ->pluck('id')
            ->map(
                fn ($id): int => (int) $id
            )
            ->values()
            ->all();

        $parentMap = [];

        foreach ($rows as $row) {
            $parentMap[(int) $row->id] =
                $row->parent_id === null
                    ? null
                    : (int) $row->parent_id;
        }

        $sectionKeys = $rows
            ->filter(
                fn ($row): bool =>
                    $row->parent_id === null
            )
            ->pluck('section_key')
            ->unique()
            ->values();

        $sections = $sectionKeys
            ->map(
                function (
                    string $sectionKey
                ) use ($rows): array {
                    return [
                        'key' => $sectionKey,
                        'label' =>
                            $this->sectionLabel(
                                $sectionKey
                            ),
                        'items' =>
                            $this->buildPermissionItems(
                                $rows,
                                null,
                                $sectionKey
                            ),
                    ];
                }
            )
            ->filter(
                fn (array $section): bool =>
                    count(
                        $section['items']
                    ) > 0
            )
            ->values()
            ->all();

        return [
            'sections' => $sections,
            'assignable_ids' =>
                $assignableIds,
            'required_ids' =>
                $requiredIds,
            'parent_map' =>
                $parentMap,
        ];
    }

    private function buildPermissionItems(
        Collection $rows,
        ?int $parentId,
        ?string $sectionKey = null
    ): array {
        return $rows
            ->filter(
                function ($row) use (
                    $parentId,
                    $sectionKey
                ): bool {
                    $rowParentId =
                        $row->parent_id === null
                            ? null
                            : (int) $row->parent_id;

                    if (
                        $rowParentId
                        !== $parentId
                    ) {
                        return false;
                    }

                    if (
                        $parentId === null
                        && $sectionKey !== null
                    ) {
                        return (
                            $row->section_key
                            === $sectionKey
                        );
                    }

                    return true;
                }
            )
            ->map(
                function ($row) use (
                    $rows
                ): array {
                    return [
                        'id' => (int) $row->id,
                        'parent_id' =>
                            $row->parent_id === null
                                ? null
                                : (int) $row->parent_id,
                        'key' =>
                            (string) $row->item_key,
                        'section_key' =>
                            (string) $row->section_key,
                        'type' =>
                            (string) $row->item_type,
                        'label' =>
                            (string) $row->label,
                        'route_name' =>
                            $row->route_name,
                        'url' =>
                            $row->url_override
                            ?: '#',
                        'icon_key' =>
                            $row->icon_key,
                        'feature_code' =>
                            $row->feature_code,
                        'description' =>
                            $row->description,
                        'required' => in_array(
                            $row->item_key,
                            self::REQUIRED_ITEM_KEYS,
                            true
                        ),
                        'assignable' =>
                            $row->item_type
                            === 'link',
                        'children' =>
                            $this->buildPermissionItems(
                                $rows,
                                (int) $row->id
                            ),
                    ];
                }
            )
            ->values()
            ->all();
    }

    private function assignedItemIds(
        array $context,
        int $productRoleId,
        array $assignableIds
    ): array {
        $tenantQuery = DB::connection('saas')
            ->table(
                'account_role_sidebar_items'
            )
            ->where(
                'account_owner_id',
                $context['account_owner_id']
            )
            ->where(
                'product_id',
                $context['product_id']
            )
            ->where(
                'product_user_type_id',
                $productRoleId
            );

        if ($tenantQuery->exists()) {
            $assignedIds = $tenantQuery
                ->where('is_enabled', 1)
                ->pluck('sidebar_item_id')
                ->map(
                    fn ($id): int =>
                        (int) $id
                )
                ->all();
        } else {
            $assignedIds = DB::connection(
                'saas'
            )
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
                    $productRoleId
                )
                ->where(
                    'permission.is_enabled',
                    1
                )
                ->where(
                    'sidebar.product_id',
                    $context['product_id']
                )
                ->pluck(
                    'permission.sidebar_item_id'
                )
                ->map(
                    fn ($id): int =>
                        (int) $id
                )
                ->all();
        }

        return collect($assignedIds)
            ->intersect($assignableIds)
            ->map(
                fn ($id): int => (int) $id
            )
            ->unique()
            ->sort()
            ->values()
            ->all();
    }

    private function includeParentItems(
        Collection $selectedIds,
        array $parentMap
    ): Collection {
        $result = $selectedIds
            ->map(
                fn ($id): int => (int) $id
            )
            ->unique()
            ->values();

        foreach ($result->all() as $itemId) {
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

                $result->push($parentId);
                $currentId = $parentId;
            }
        }

        return $result
            ->unique()
            ->sort()
            ->values();
    }

    private function findAssignableRole(
        int $productId,
        int $roleId
    ): ?object {
        return DB::connection('saas')
            ->table(
                'product_user_types as product_role'
            )
            ->join(
                'user_types as user_type',
                'user_type.id',
                '=',
                'product_role.user_type_id'
            )
            ->where(
                'product_role.id',
                $roleId
            )
            ->where(
                'product_role.product_id',
                $productId
            )
            ->where(
                'product_role.status',
                'active'
            )
            ->where(
                'user_type.status',
                'active'
            )
            ->where(
                'user_type.is_owner_type',
                0
            )
            ->select([
                'product_role.id',
                'product_role.display_name',
                'user_type.type_code',
                'user_type.name',
            ])
            ->first();
    }

    private function sectionLabel(
        string $sectionKey
    ): string {
        return match ($sectionKey) {
            'overview' => 'Overview',
            'management' => 'Management',
            'reports' => 'Reports',
            'settings' => 'Settings',
            default => str($sectionKey)
                ->replace(['-', '_'], ' ')
                ->title()
                ->toString(),
        };
    }
}