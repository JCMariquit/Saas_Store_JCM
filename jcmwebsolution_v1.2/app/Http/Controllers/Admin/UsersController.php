<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PlatformRole;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UsersController extends Controller
{
    private const MANAGEABLE_ROLES = ['super_admin', 'admin', 'user'];

    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        $users = User::query()
            ->with(['platformRoles' => fn ($query) => $query
                ->where('user_platform_roles.status', 'active')
                ->where('platform_roles.status', 'active')
                ->orderByDesc('user_platform_roles.is_primary')
                ->orderBy('platform_roles.sort_order')])
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($subQuery) use ($search): void {
                    $subQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhereHas('platformRoles', fn ($roleQuery) => $roleQuery
                            ->where('platform_roles.name', 'like', "%{$search}%")
                            ->orWhere('platform_roles.role_code', 'like', "%{$search}%"));
                });
            })
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString()
            ->through(function (User $user): array {
                $role = $user->platformRoles->first();

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => (string) ($role?->role_code ?? 'user'),
                    'role_code' => (string) ($role?->role_code ?? 'user'),
                    'role_name' => $role?->name ?? 'Platform User',
                    'is_active' => (bool) $user->is_active,
                    'created_at' => $user->created_at?->format('M d, Y h:i A'),
                ];
            });

        $adminRoleIds = PlatformRole::query()
            ->whereIn('role_code', ['super_admin', 'admin'])
            ->pluck('id');

        $adminCount = DB::table('user_platform_roles as user_roles')
            ->join('users', 'users.id', '=', 'user_roles.user_id')
            ->whereIn('user_roles.platform_role_id', $adminRoleIds)
            ->where('user_roles.status', 'active')
            ->where('users.is_active', true)
            ->distinct('user_roles.user_id')
            ->count('user_roles.user_id');

        return Inertia::render('admin/users/index', [
            'filters' => ['search' => $search],
            'users' => $users,
            'canManageSuperAdmins' => $request->user()?->hasPlatformRole('super_admin') ?? false,
            'stats' => [
                'total_users' => User::count(),
                'active_users' => User::where('is_active', true)->count(),
                'inactive_users' => User::where('is_active', false)->count(),
                'total_admins' => $adminCount,
                'total_clients' => User::query()
                    ->whereDoesntHave('platformRoles', fn ($query) => $query
                        ->where('user_platform_roles.status', 'active')
                        ->whereIn('platform_roles.role_code', ['super_admin', 'admin']))
                    ->count(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'min:8', 'confirmed'],
            'role' => ['required', Rule::in(self::MANAGEABLE_ROLES)],
            'is_active' => ['required', 'boolean'],
        ]);

        $this->assertRoleAssignmentAllowed($request, $validated['role']);

        DB::transaction(function () use ($validated, $request): void {
            $user = User::create([
                'name' => $validated['name'],
                'email' => mb_strtolower($validated['email']),
                'password' => Hash::make($validated['password']),
                'created_by' => $request->user()?->getKey(),
                'is_active' => $validated['is_active'],
            ]);

            $this->assignRole($user, $validated['role'], $request->user()?->getKey());
        });

        return to_route('admin.users.index')->with('success', 'User created successfully.');
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,'.$user->id],
            'role' => ['required', Rule::in(self::MANAGEABLE_ROLES)],
            'is_active' => ['required', 'boolean'],
            'password' => ['nullable', 'min:8', 'confirmed'],
        ]);

        $currentRole = $user->primaryPlatformRoleCode();
        $this->assertRoleAssignmentAllowed($request, $validated['role'], $currentRole);

        if ($currentRole === 'super_admin' && ! $request->user()?->hasPlatformRole('super_admin')) {
            abort(403, 'Only a super administrator can modify a super administrator account.');
        }

        $removesAdminAccess = in_array($currentRole, ['super_admin', 'admin'], true)
            && (! in_array($validated['role'], ['super_admin', 'admin'], true) || ! $validated['is_active']);

        if ($removesAdminAccess && ! $this->hasAnotherActiveAdministrator($user->id)) {
            return back()->with('success', 'The last active administrator cannot be downgraded or deactivated.');
        }

        DB::transaction(function () use ($validated, $request, $user): void {
            $payload = [
                'name' => $validated['name'],
                'email' => mb_strtolower($validated['email']),
                'is_active' => $validated['is_active'],
            ];

            if (! empty($validated['password'])) {
                $payload['password'] = Hash::make($validated['password']);
            }

            $user->update($payload);
            $this->assignRole($user, $validated['role'], $request->user()?->getKey());
        });

        return to_route('admin.users.index')->with('success', 'User updated successfully.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($request->user()?->is($user)) {
            return back()->with('success', 'You cannot delete the account currently in use.');
        }

        $roleCode = $user->primaryPlatformRoleCode();

        if ($roleCode === 'super_admin' && ! $request->user()?->hasPlatformRole('super_admin')) {
            abort(403, 'Only a super administrator can remove a super administrator account.');
        }

        if (in_array($roleCode, ['super_admin', 'admin'], true) && ! $this->hasAnotherActiveAdministrator($user->id)) {
            return back()->with('success', 'The last active administrator cannot be deleted.');
        }

        if ($this->hasHistoricalRecords($user->id)) {
            $user->update(['is_active' => false]);

            return back()->with('success', 'This account has platform records and was deactivated instead of deleted.');
        }

        $user->delete();

        return to_route('admin.users.index')->with('success', 'User deleted successfully.');
    }

    public function list(): JsonResponse
    {
        abort_unless(Auth::user()?->isAdmin(), 403);

        $users = User::query()
            ->where('is_active', true)
            ->whereDoesntHave('platformRoles', fn ($query) => $query
                ->where('user_platform_roles.status', 'active')
                ->whereIn('platform_roles.role_code', ['super_admin', 'admin']))
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return response()->json(['users' => $users]);
    }

    private function assertRoleAssignmentAllowed(Request $request, string $newRole, ?string $currentRole = null): void
    {
        if (($newRole === 'super_admin' || $currentRole === 'super_admin')
            && ! $request->user()?->hasPlatformRole('super_admin')) {
            abort(403, 'Only a super administrator can assign or modify the super administrator role.');
        }
    }

    private function assignRole(User $user, string $roleCode, ?int $assignedBy): void
    {
        $role = PlatformRole::query()
            ->where('role_code', $roleCode)
            ->where('status', 'active')
            ->firstOrFail();

        DB::table('user_platform_roles')
            ->where('user_id', $user->id)
            ->update([
                'is_primary' => false,
                'status' => 'inactive',
                'updated_at' => now(),
            ]);

        $lookup = [
            'user_id' => $user->id,
            'platform_role_id' => $role->id,
        ];

        $values = [
            'is_primary' => true,
            'status' => 'active',
            'assigned_by' => $assignedBy,
            'assigned_at' => now(),
            'updated_at' => now(),
        ];

        $existing = DB::table('user_platform_roles')->where($lookup)->first();

        if ($existing) {
            DB::table('user_platform_roles')->where('id', $existing->id)->update($values);
        } else {
            DB::table('user_platform_roles')->insert($lookup + $values + ['created_at' => now()]);
        }

        // Keep the temporary legacy role column synchronized while the
        // canonical user_platform_roles table remains the access authority.
        $user->forceFill([
            'role' => in_array($roleCode, ['super_admin', 'admin'], true) ? $roleCode : 'client',
        ])->saveQuietly();
    }

    private function hasAnotherActiveAdministrator(int $excludedUserId): bool
    {
        return DB::table('user_platform_roles as user_roles')
            ->join('platform_roles as roles', 'roles.id', '=', 'user_roles.platform_role_id')
            ->join('users', 'users.id', '=', 'user_roles.user_id')
            ->whereIn('roles.role_code', ['super_admin', 'admin'])
            ->where('roles.status', 'active')
            ->where('user_roles.status', 'active')
            ->where('users.is_active', true)
            ->where('users.id', '!=', $excludedUserId)
            ->exists();
    }

    private function hasHistoricalRecords(int $userId): bool
    {
        return DB::table('orders')->where('user_id', $userId)->orWhere('account_owner_id', $userId)->exists()
            || DB::table('subscriptions')->where('user_id', $userId)->orWhere('account_owner_id', $userId)->exists()
            || DB::table('transactions')->where('user_id', $userId)->exists()
            || DB::table('user_product_access')->where('user_id', $userId)->orWhere('account_owner_id', $userId)->exists();
    }
}
