<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class TeamMemberController extends Controller
{
    private const PRODUCT_CODE = 'JCM-INVENTORY-001';

    public function index(Request $request): Response
    {
        $context = $this->ownerContext($request);

        $ownerId = $context['owner_id'];
        $productId = $context['product_id'];

        $search = trim(
            (string) $request->input('search', '')
        );

        $status = trim(
            (string) $request->input('status', '')
        );

        $roleId = (int) $request->input(
            'product_user_type_id',
            0
        );

        $branchId = (int) $request->input(
            'branch_id',
            0
        );

        $members = DB::connection('saas')
            ->table('user_product_access as access')
            ->join(
                'users',
                'users.id',
                '=',
                'access.user_id'
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
            ->leftJoin(
                'users as creator',
                'creator.id',
                '=',
                'users.created_by'
            )
            ->where(
                'access.account_owner_id',
                $ownerId
            )
            ->where(
                'access.product_id',
                $productId
            )
            ->where(
                'user_types.is_owner_type',
                false
            )
            ->whereNot(
                'access.status',
                'removed'
            )
            ->when(
                $search !== '',
                function ($query) use ($search): void {
                    $like = "%{$search}%";

                    $query->where(
                        function ($searchQuery) use (
                            $like
                        ): void {
                            $searchQuery
                                ->where(
                                    'users.name',
                                    'like',
                                    $like
                                )
                                ->orWhere(
                                    'users.email',
                                    'like',
                                    $like
                                )
                                ->orWhere(
                                    'product_user_types.display_name',
                                    'like',
                                    $like
                                )
                                ->orWhere(
                                    'user_types.name',
                                    'like',
                                    $like
                                );
                        }
                    );
                }
            )
            ->when(
                $status === 'active',
                fn ($query) => $query
                    ->where(
                        'access.status',
                        'active'
                    )
                    ->where(
                        'users.is_active',
                        true
                    )
            )
            ->when(
                $status === 'inactive',
                function ($query): void {
                    $query->where(
                        function ($statusQuery): void {
                            $statusQuery
                                ->where(
                                    'access.status',
                                    'inactive'
                                )
                                ->orWhere(
                                    'users.is_active',
                                    false
                                );
                        }
                    );
                }
            )
            ->when(
                $roleId > 0,
                fn ($query) => $query->where(
                    'access.product_user_type_id',
                    $roleId
                )
            )
            ->when(
                $branchId > 0,
                fn ($query) => $query->where(
                    'users.branch_id',
                    $branchId
                )
            )
            ->select([
                'users.id',
                'users.name',
                'users.email',
                'users.email_verified_at',
                'users.branch_id',
                'users.is_active as account_is_active',
                'users.created_by',
                'users.created_at',
                'users.updated_at',

                'access.id as access_id',
                'access.product_user_type_id',
                'access.status as access_status',
                'access.joined_at',
                'access.assigned_by',

                'product_user_types.display_name',

                'user_types.type_code',
                'user_types.name as role_name',

                'creator.name as created_by_name',
            ])
            ->orderByDesc('users.created_at')
            ->orderByDesc('users.id')
            ->paginate(15)
            ->withQueryString();

        $memberBranchIds = $members
            ->getCollection()
            ->pluck('branch_id')
            ->filter()
            ->map(
                fn ($id): int => (int) $id
            )
            ->unique()
            ->values();

        $memberBranches = $memberBranchIds->isEmpty()
            ? collect()
            : DB::connection('mysql')
                ->table('branches')
                ->where(
                    'tenant_id',
                    $ownerId
                )
                ->whereIn(
                    'id',
                    $memberBranchIds
                )
                ->get([
                    'id',
                    'name',
                    'code',
                    'is_main',
                    'is_active',
                ])
                ->keyBy('id');

        $members->setCollection(
            $members
                ->getCollection()
                ->map(
                    function ($member) use (
                        $memberBranches
                    ): array {
                        $branch = $member->branch_id
                            ? $memberBranches->get(
                                (int) $member->branch_id
                            )
                            : null;

                        $isActive =
                            $member->access_status
                                === 'active'
                            && (bool) $member
                                ->account_is_active;

                        return [
                            'id' => (int) $member->id,

                            'access_id' =>
                                (int) $member->access_id,

                            'name' => $member->name,

                            'email' => $member->email,

                            'email_verified_at' =>
                                $member
                                    ->email_verified_at,

                            'is_active' => $isActive,

                            'account_is_active' =>
                                (bool) $member
                                    ->account_is_active,

                            'access_status' =>
                                $member->access_status,

                            'status_label' =>
                                $isActive
                                    ? 'Active'
                                    : 'Inactive',

                            'role' => [
                                'id' => (int) $member
                                    ->product_user_type_id,

                                'code' =>
                                    $member->type_code,

                                'name' =>
                                    $member->display_name
                                    ?: $member->role_name,
                            ],

                            'branch' => $branch
                                ? [
                                    'id' =>
                                        (int) $branch->id,

                                    'name' =>
                                        $branch->name,

                                    'code' =>
                                        $branch->code,

                                    'is_main' =>
                                        (bool) $branch
                                            ->is_main,

                                    'is_active' =>
                                        (bool) $branch
                                            ->is_active,
                                ]
                                : null,

                            'created_by' => [
                                'id' => $member->created_by
                                    ? (int) $member
                                        ->created_by
                                    : null,

                                'name' =>
                                    $member
                                        ->created_by_name,
                            ],

                            'joined_at' =>
                                $member->joined_at,

                            'created_at' =>
                                $member->created_at,

                            'updated_at' =>
                                $member->updated_at,
                        ];
                    }
                )
        );

        $baseSummary = DB::connection('saas')
            ->table('user_product_access as access')
            ->join(
                'users',
                'users.id',
                '=',
                'access.user_id'
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
            ->where(
                'access.account_owner_id',
                $ownerId
            )
            ->where(
                'access.product_id',
                $productId
            )
            ->where(
                'user_types.is_owner_type',
                false
            )
            ->whereNot(
                'access.status',
                'removed'
            );

        $summary = [
            'total' => (clone $baseSummary)
                ->count(),

            'active' => (clone $baseSummary)
                ->where(
                    'access.status',
                    'active'
                )
                ->where(
                    'users.is_active',
                    true
                )
                ->count(),

            'inactive' => (clone $baseSummary)
                ->where(
                    function ($query): void {
                        $query
                            ->where(
                                'access.status',
                                'inactive'
                            )
                            ->orWhere(
                                'users.is_active',
                                false
                            );
                    }
                )
                ->count(),

            'managers' => (clone $baseSummary)
                ->where(
                    'user_types.type_code',
                    'manager'
                )
                ->count(),

            'staff' => (clone $baseSummary)
                ->where(
                    'user_types.type_code',
                    'staff'
                )
                ->count(),
        ];

        $roles = $this->assignableRoles(
            $productId
        );

        $branches = DB::connection('mysql')
            ->table('branches')
            ->where(
                'tenant_id',
                $ownerId
            )
            ->where(
                'is_active',
                true
            )
            ->whereNull('deleted_at')
            ->orderByDesc('is_main')
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'code',
                'is_main',
            ])
            ->map(
                fn ($branch): array => [
                    'id' => (int) $branch->id,
                    'name' => $branch->name,
                    'code' => $branch->code,
                    'is_main' =>
                        (bool) $branch->is_main,
                ]
            )
            ->values();

        return Inertia::render(
            'team-management/team-members/index',
            [
                'members' => $members,
                'summary' => $summary,
                'roles' => $roles,
                'branches' => $branches,

                'filters' => [
                    'search' => $search,
                    'status' => $status,

                    'product_user_type_id' =>
                        $roleId > 0
                            ? (string) $roleId
                            : '',

                    'branch_id' =>
                        $branchId > 0
                            ? (string) $branchId
                            : '',
                ],
            ]
        );
    }

    public function store(
        Request $request
    ): RedirectResponse {
        $context = $this->ownerContext($request);

        $ownerId = $context['owner_id'];
        $productId = $context['product_id'];

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'email' => [
                'required',
                'string',
                'email',
                'max:255',

                Rule::unique(
                    'saas.users',
                    'email'
                ),
            ],

            'password' => [
                'required',
                'string',
                'min:8',
                'max:255',
                'confirmed',
            ],

            'product_user_type_id' => [
                'required',
                'integer',
            ],

            'branch_id' => [
                'required',
                'integer',
            ],
        ]);

        $role = $this->findAssignableRole(
            productId: $productId,
            productUserTypeId: (int) $validated[
                'product_user_type_id'
            ]
        );

        $this->ensureBranchExists(
            ownerId: $ownerId,
            branchId: (int) $validated[
                'branch_id'
            ]
        );

        DB::connection('saas')->transaction(
            function () use (
                $request,
                $validated,
                $context,
                $ownerId,
                $productId,
                $role
            ): void {
                $now = now();

                $userId = DB::connection('saas')
                    ->table('users')
                    ->insertGetId([
                        'name' => trim(
                            $validated['name']
                        ),

                        'email' => mb_strtolower(
                            trim($validated['email'])
                        ),

                        'password' => Hash::make(
                            $validated['password']
                        ),

                        'role' =>
                            $role->type_code,

                        'client_id' =>
                            $ownerId,

                        'branch_id' =>
                            (int) $validated[
                                'branch_id'
                            ],

                        'system_used' => null,

                        'created_by' =>
                            $request->user()->id,

                        'is_active' => true,

                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);

                DB::connection('saas')
                    ->table('user_product_access')
                    ->insert([
                        'user_id' => $userId,

                        'product_id' =>
                            $productId,

                        'product_user_type_id' =>
                            (int) $validated[
                                'product_user_type_id'
                            ],

                        'account_owner_id' =>
                            $ownerId,

                        'subscription_id' =>
                            $context[
                                'subscription_id'
                            ],

                        'status' => 'active',

                        'assigned_by' =>
                            $request->user()->id,

                        'joined_at' => $now,

                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
            }
        );

        return back()->with(
            'success',
            'Team member account created successfully.'
        );
    }

    public function update(
        Request $request,
        int $member
    ): RedirectResponse {
        $context = $this->ownerContext($request);

        $ownerId = $context['owner_id'];
        $productId = $context['product_id'];

        $teamMember = $this->findTeamMember(
            ownerId: $ownerId,
            productId: $productId,
            userId: $member
        );

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'email' => [
                'required',
                'string',
                'email',
                'max:255',

                Rule::unique(
                    'saas.users',
                    'email'
                )->ignore($member),
            ],

            'password' => [
                'nullable',
                'string',
                'min:8',
                'max:255',
                'confirmed',
            ],

            'product_user_type_id' => [
                'required',
                'integer',
            ],

            'branch_id' => [
                'required',
                'integer',
            ],
        ]);

        $role = $this->findAssignableRole(
            productId: $productId,
            productUserTypeId: (int) $validated[
                'product_user_type_id'
            ]
        );

        $this->ensureBranchExists(
            ownerId: $ownerId,
            branchId: (int) $validated[
                'branch_id'
            ]
        );

        DB::connection('saas')->transaction(
            function () use (
                $validated,
                $member,
                $teamMember,
                $role
            ): void {
                $userData = [
                    'name' => trim(
                        $validated['name']
                    ),

                    'email' => mb_strtolower(
                        trim($validated['email'])
                    ),

                    'role' =>
                        $role->type_code,

                    'branch_id' =>
                        (int) $validated[
                            'branch_id'
                        ],

                    'updated_at' => now(),
                ];

                if (
                    isset($validated['password'])
                    && trim(
                        (string) $validated[
                            'password'
                        ]
                    ) !== ''
                ) {
                    $userData['password'] =
                        Hash::make(
                            $validated['password']
                        );
                }

                DB::connection('saas')
                    ->table('users')
                    ->where('id', $member)
                    ->update($userData);

                DB::connection('saas')
                    ->table('user_product_access')
                    ->where(
                        'id',
                        $teamMember->access_id
                    )
                    ->update([
                        'product_user_type_id' =>
                            (int) $validated[
                                'product_user_type_id'
                            ],

                        'updated_at' => now(),
                    ]);
            }
        );

        return back()->with(
            'success',
            'Team member updated successfully.'
        );
    }

    public function updateStatus(
        Request $request,
        int $member
    ): RedirectResponse {
        $context = $this->ownerContext($request);

        $teamMember = $this->findTeamMember(
            ownerId: $context['owner_id'],
            productId: $context['product_id'],
            userId: $member
        );

        $validated = $request->validate([
            'is_active' => [
                'required',
                'boolean',
            ],
        ]);

        $isActive = (bool) $validated[
            'is_active'
        ];

        DB::connection('saas')->transaction(
            function () use (
                $member,
                $teamMember,
                $isActive
            ): void {
                DB::connection('saas')
                    ->table('user_product_access')
                    ->where(
                        'id',
                        $teamMember->access_id
                    )
                    ->update([
                        'status' =>
                            $isActive
                                ? 'active'
                                : 'inactive',

                        'joined_at' =>
                            $isActive
                            && ! $teamMember
                                ->joined_at
                                ? now()
                                : $teamMember
                                    ->joined_at,

                        'updated_at' => now(),
                    ]);

                if ($isActive) {
                    DB::connection('saas')
                        ->table('users')
                        ->where('id', $member)
                        ->update([
                            'is_active' => true,
                            'updated_at' => now(),
                        ]);
                }
            }
        );

        return back()->with(
            'success',
            $isActive
                ? 'Team member activated successfully.'
                : 'Team member deactivated successfully.'
        );
    }

    public function resetPassword(
        Request $request,
        int $member
    ): RedirectResponse {
        $context = $this->ownerContext($request);

        $this->findTeamMember(
            ownerId: $context['owner_id'],
            productId: $context['product_id'],
            userId: $member
        );

        $validated = $request->validate([
            'password' => [
                'required',
                'string',
                'min:8',
                'max:255',
                'confirmed',
            ],
        ]);

        DB::connection('saas')
            ->table('users')
            ->where('id', $member)
            ->update([
                'password' => Hash::make(
                    $validated['password']
                ),

                'updated_at' => now(),
            ]);

        return back()->with(
            'success',
            'Team member password reset successfully.'
        );
    }

    public function destroy(
        Request $request,
        int $member
    ): RedirectResponse {
        $context = $this->ownerContext($request);

        $teamMember = $this->findTeamMember(
            ownerId: $context['owner_id'],
            productId: $context['product_id'],
            userId: $member
        );

        DB::connection('saas')->transaction(
            function () use (
                $member,
                $teamMember
            ): void {
                DB::connection('saas')
                    ->table('user_product_access')
                    ->where(
                        'id',
                        $teamMember->access_id
                    )
                    ->update([
                        'status' => 'removed',
                        'updated_at' => now(),
                    ]);

                $hasRemainingAccess =
                    DB::connection('saas')
                        ->table(
                            'user_product_access'
                        )
                        ->where(
                            'user_id',
                            $member
                        )
                        ->whereIn(
                            'status',
                            [
                                'pending',
                                'active',
                                'inactive',
                            ]
                        )
                        ->exists();

                if (! $hasRemainingAccess) {
                    DB::connection('saas')
                        ->table('users')
                        ->where('id', $member)
                        ->update([
                            'is_active' => false,
                            'updated_at' => now(),
                        ]);
                }
            }
        );

        return back()->with(
            'success',
            'Team member removed successfully.'
        );
    }

    private function ownerContext(
        Request $request
    ): array {
        $userId = (int) $request->user()->id;

        $product = DB::connection('saas')
            ->table('products')
            ->where(
                'product_code',
                self::PRODUCT_CODE
            )
            ->first([
                'id',
                'product_code',
                'name',
                'status',
            ]);

        abort_if(
            ! $product,
            404,
            'JCM Inventory product is not configured.'
        );

        $ownerAccess = DB::connection('saas')
            ->table('user_product_access as access')
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
            ->where(
                'access.user_id',
                $userId
            )
            ->where(
                'access.account_owner_id',
                $userId
            )
            ->where(
                'access.product_id',
                $product->id
            )
            ->where(
                'access.status',
                'active'
            )
            ->where(
                'user_types.is_owner_type',
                true
            )
            ->first([
                'access.subscription_id',
            ]);

        abort_if(
            ! $ownerAccess,
            403,
            'Only the account owner can manage team members.'
        );

        return [
            'owner_id' => $userId,

            'product_id' =>
                (int) $product->id,

            'subscription_id' =>
                $ownerAccess->subscription_id
                    ? (int) $ownerAccess
                        ->subscription_id
                    : null,
        ];
    }

    private function assignableRoles(
        int $productId
    ): Collection {
        return DB::connection('saas')
            ->table('product_user_types')
            ->join(
                'user_types',
                'user_types.id',
                '=',
                'product_user_types.user_type_id'
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
            ->orderBy('user_types.sort_order')
            ->get([
                'product_user_types.id',
                'product_user_types.display_name',
                'user_types.type_code',
                'user_types.name',
                'user_types.description',
            ])
            ->map(
                fn ($role): array => [
                    'id' => (int) $role->id,

                    'code' =>
                        $role->type_code,

                    'name' =>
                        $role->display_name
                        ?: $role->name,

                    'description' =>
                        $role->description,
                ]
            )
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
                'product_user_type_id' =>
                    'The selected team role is unavailable.',
            ]);
        }

        return $role;
    }

    private function ensureBranchExists(
        int $ownerId,
        int $branchId
    ): void {
        $branchExists = DB::connection('mysql')
            ->table('branches')
            ->where('id', $branchId)
            ->where(
                'tenant_id',
                $ownerId
            )
            ->where(
                'is_active',
                true
            )
            ->whereNull('deleted_at')
            ->exists();

        if (! $branchExists) {
            throw ValidationException::withMessages([
                'branch_id' =>
                    'The selected branch is unavailable.',
            ]);
        }
    }

    private function findTeamMember(
        int $ownerId,
        int $productId,
        int $userId
    ): object {
        $member = DB::connection('saas')
            ->table('user_product_access as access')
            ->join(
                'users',
                'users.id',
                '=',
                'access.user_id'
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
            ->where(
                'access.user_id',
                $userId
            )
            ->where(
                'access.account_owner_id',
                $ownerId
            )
            ->where(
                'access.product_id',
                $productId
            )
            ->whereNot(
                'access.status',
                'removed'
            )
            ->where(
                'user_types.is_owner_type',
                false
            )
            ->first([
                'users.id',
                'users.name',
                'users.email',
                'users.branch_id',
                'users.is_active',

                'access.id as access_id',
                'access.status as access_status',
                'access.joined_at',
                'access.product_user_type_id',
            ]);

        abort_if(
            ! $member,
            404,
            'Team member not found.'
        );

        return $member;
    }
}