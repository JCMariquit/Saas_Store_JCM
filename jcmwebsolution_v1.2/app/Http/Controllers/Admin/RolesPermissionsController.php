<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\PlatformAuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class RolesPermissionsController extends Controller
{
    public function __construct(private readonly PlatformAuditLogger $audit)
    {
    }

    public function index(Request $request): Response
    {
        $roles = DB::table('platform_roles')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(function (object $role): object {
                $role->permission_ids = DB::table('platform_role_permissions')
                    ->where('platform_role_id', $role->id)
                    ->where('is_allowed', true)
                    ->pluck('permission_id')
                    ->map(fn ($id): int => (int) $id)
                    ->all();

                $role->user_count = DB::table('user_platform_roles')
                    ->where('platform_role_id', $role->id)
                    ->where('status', 'active')
                    ->count();

                return $role;
            });

        $permissions = DB::table('platform_permissions')
            ->orderBy('module')
            ->orderBy('name')
            ->get();

        $assignments = DB::table('user_platform_roles')
            ->join('users', 'users.id', '=', 'user_platform_roles.user_id')
            ->join('platform_roles', 'platform_roles.id', '=', 'user_platform_roles.platform_role_id')
            ->leftJoin('users as assigners', 'assigners.id', '=', 'user_platform_roles.assigned_by')
            ->select([
                'user_platform_roles.id',
                'user_platform_roles.user_id',
                'user_platform_roles.platform_role_id',
                'user_platform_roles.is_primary',
                'user_platform_roles.status',
                'user_platform_roles.assigned_at',
                'users.name as user_name',
                'users.email as user_email',
                'platform_roles.name as role_name',
                'platform_roles.role_code',
                'assigners.name as assigned_by_name',
            ])
            ->orderByDesc('user_platform_roles.assigned_at')
            ->limit(100)
            ->get();

        $users = DB::table('users')
            ->select('id', 'name', 'email', 'is_active')
            ->where('is_active', true)
            ->orderBy('name')
            ->limit(500)
            ->get();

        return Inertia::render('admin/roles-permissions/index', [
            'roles' => $roles,
            'permissions' => $permissions,
            'assignments' => $assignments,
            'users' => $users,
            'stats' => [
                'roles' => $roles->count(),
                'permissions' => $permissions->count(),
                'assignments' => $assignments->where('status', 'active')->count(),
                'admins' => $assignments->whereIn('role_code', ['admin', 'super_admin'])->where('status', 'active')->count(),
            ],
        ]);
    }

    public function storeRole(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'role_code' => ['nullable', 'string', 'max:50', 'regex:/^[a-z0-9_]+$/', 'unique:platform_roles,role_code'],
            'description' => ['nullable', 'string', 'max:255'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ]);

        $code = $validated['role_code'] ?: Str::snake($validated['name']);
        $sortOrder = (int) DB::table('platform_roles')->max('sort_order') + 10;

        $id = DB::table('platform_roles')->insertGetId([
            'role_code' => $code,
            'name' => $validated['name'],
            'description' => $validated['description'] ?: null,
            'is_system_role' => false,
            'sort_order' => $sortOrder,
            'status' => $validated['status'],
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->audit->write(
            $request,
            'roles_permissions',
            'role_created',
            "Created platform role {$validated['name']}.",
            'platform_roles',
            $id,
            null,
            $validated,
        );

        return back()->with('success', 'Platform role created.');
    }

    public function updateRole(Request $request, int $role): RedirectResponse
    {
        $existing = DB::table('platform_roles')->where('id', $role)->first();
        abort_unless($existing, 404);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:255'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ]);

        DB::table('platform_roles')->where('id', $role)->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?: null,
            'status' => $validated['status'],
            'updated_at' => now(),
        ]);

        $this->audit->write(
            $request,
            'roles_permissions',
            'role_updated',
            "Updated platform role {$validated['name']}.",
            'platform_roles',
            $role,
            $existing,
            $validated,
        );

        return back()->with('success', 'Platform role updated.');
    }

    public function storePermission(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'permission_code' => ['required', 'string', 'max:100', 'regex:/^[a-z0-9_.-]+$/', 'unique:platform_permissions,permission_code'],
            'name' => ['required', 'string', 'max:140'],
            'module' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:255'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ]);

        $id = DB::table('platform_permissions')->insertGetId([
            ...$validated,
            'description' => $validated['description'] ?: null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->audit->write(
            $request,
            'roles_permissions',
            'permission_created',
            "Created permission {$validated['permission_code']}.",
            'platform_permissions',
            $id,
            null,
            $validated,
        );

        return back()->with('success', 'Permission created.');
    }

    public function destroyPermission(Request $request, int $permission): RedirectResponse
    {
        $existing = DB::table('platform_permissions')->where('id', $permission)->first();
        abort_unless($existing, 404);

        DB::transaction(function () use ($permission): void {
            DB::table('platform_role_permissions')->where('permission_id', $permission)->delete();
            DB::table('platform_permissions')->where('id', $permission)->delete();
        });

        $this->audit->write(
            $request,
            'roles_permissions',
            'permission_deleted',
            "Deleted permission {$existing->permission_code}.",
            'platform_permissions',
            $permission,
            $existing,
        );

        return back()->with('success', 'Permission deleted.');
    }

    public function togglePermission(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'platform_role_id' => ['required', 'integer', 'exists:platform_roles,id'],
            'permission_id' => ['required', 'integer', 'exists:platform_permissions,id'],
            'is_allowed' => ['required', 'boolean'],
        ]);

        DB::table('platform_role_permissions')->updateOrInsert(
            [
                'platform_role_id' => $validated['platform_role_id'],
                'permission_id' => $validated['permission_id'],
            ],
            [
                'is_allowed' => $validated['is_allowed'],
                'created_at' => now(),
                'updated_at' => now(),
            ],
        );

        $role = DB::table('platform_roles')->where('id', $validated['platform_role_id'])->value('name');
        $permission = DB::table('platform_permissions')->where('id', $validated['permission_id'])->value('permission_code');

        $this->audit->write(
            $request,
            'roles_permissions',
            'permission_toggled',
            sprintf('%s permission %s for %s.', $validated['is_allowed'] ? 'Enabled' : 'Disabled', $permission, $role),
            'platform_role_permissions',
            $validated['platform_role_id'].'-'.$validated['permission_id'],
            null,
            $validated,
        );

        return back();
    }

    public function assignRole(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'platform_role_id' => ['required', 'integer', 'exists:platform_roles,id'],
            'is_primary' => ['required', 'boolean'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ]);

        DB::transaction(function () use ($validated, $request): void {
            if ($validated['is_primary'] && $validated['status'] === 'active') {
                DB::table('user_platform_roles')
                    ->where('user_id', $validated['user_id'])
                    ->update([
                        'is_primary' => false,
                        'updated_at' => now(),
                    ]);
            }

            DB::table('user_platform_roles')->updateOrInsert(
                [
                    'user_id' => $validated['user_id'],
                    'platform_role_id' => $validated['platform_role_id'],
                ],
                [
                    'is_primary' => $validated['is_primary'],
                    'status' => $validated['status'],
                    'assigned_by' => $request->user()?->getKey(),
                    'assigned_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            );
        });

        $user = DB::table('users')->where('id', $validated['user_id'])->value('name');
        $role = DB::table('platform_roles')->where('id', $validated['platform_role_id'])->value('name');

        $this->audit->write(
            $request,
            'roles_permissions',
            'role_assigned',
            "Assigned {$role} to {$user}.",
            'user_platform_roles',
            $validated['user_id'].'-'.$validated['platform_role_id'],
            null,
            $validated,
        );

        return back()->with('success', 'Platform role assignment saved.');
    }

    public function destroyAssignment(Request $request, int $assignment): RedirectResponse
    {
        $existing = DB::table('user_platform_roles')->where('id', $assignment)->first();
        abort_unless($existing, 404);

        DB::table('user_platform_roles')->where('id', $assignment)->delete();

        $this->audit->write(
            $request,
            'roles_permissions',
            'role_unassigned',
            'Removed a platform role assignment.',
            'user_platform_roles',
            $assignment,
            $existing,
        );

        return back()->with('success', 'Role assignment removed.');
    }
}
