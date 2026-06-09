<?php

namespace App\Http\Controllers\Staff\Manager;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\User;
use App\Support\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ManagerStaffController extends Controller
{
    private function managerBranch(): Branch
    {
        $user = auth()->user();

        abort_if(!$user->branch_id, 403, 'No branch assigned to this manager.');
        abort_if(!$user->client_id, 403, 'No client assigned to this manager.');

        return Branch::query()
            ->where('id', $user->branch_id)
            ->where('tenant_id', $user->client_id)
            ->where('is_active', true)
            ->firstOrFail([
                'id',
                'tenant_id',
                'name',
                'code',
                'is_main',
                'is_active',
            ]);
    }

    public function index(Request $request)
    {
        $branch = $this->managerBranch();

        $tenantId = (int) $branch->tenant_id;
        $branchId = (int) $branch->id;

        $search = trim((string) $request->input('search', ''));

        ActivityLogger::log(
            module: 'employee',
            action: 'viewed',
            description: 'Viewed employee list.',
            properties: [
                'search' => $search ?: null,
            ],
            tenantId: $tenantId,
            branchId: $branchId
        );

        $staff = User::query()
            ->where('created_by', $tenantId)
            ->where('branch_id', $branchId)
            ->whereIn('role', ['cashier', 'staff'])
            ->when($search, function ($query, $search) {
                $query->where(function ($subQuery) use ($search) {
                    $subQuery
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('role', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->get([
                'id',
                'created_by',
                'branch_id',
                'name',
                'email',
                'role',
                'is_active',
                'created_at',
                'updated_at',
            ]);

        return Inertia::render('staff/manager/employee/index', [
            'staff' => $staff,
            'branch' => $branch,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $branch = $this->managerBranch();

        $tenantId = (int) $branch->tenant_id;
        $branchId = (int) $branch->id;

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:180'],
            'email' => [
                'required',
                'email',
                'max:180',
                Rule::unique('users', 'email'),
            ],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', Rule::in(['cashier', 'staff'])],
            'is_active' => ['boolean'],
        ]);

        $createdStaff = User::create([
            'created_by' => $tenantId,
            'branch_id' => $branchId,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        ActivityLogger::log(
            module: 'employee',
            action: 'created',
            description: 'Created employee "' . $createdStaff->name . '".',
            subject: $createdStaff,
            properties: [
                'employee_id' => $createdStaff->id,
                'name' => $createdStaff->name,
                'role' => $createdStaff->role,
                'is_active' => (bool) $createdStaff->is_active,
            ],
            tenantId: $tenantId,
            branchId: $branchId
        );

        return back()->with('success', 'Staff created successfully.');
    }

    public function update(Request $request, User $staff)
    {
        $branch = $this->authorizeStaff($staff);

        $tenantId = (int) $branch->tenant_id;
        $branchId = (int) $branch->id;

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:180'],
            'email' => [
                'required',
                'email',
                'max:180',
                Rule::unique('users', 'email')->ignore($staff->id),
            ],
            'password' => ['nullable', 'string', 'min:8'],
            'role' => ['required', Rule::in(['cashier', 'staff'])],
            'is_active' => ['boolean'],
        ]);

        $data = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'is_active' => $validated['is_active'] ?? true,
        ];

        $passwordChanged = !empty($validated['password']);

        if ($passwordChanged) {
            $data['password'] = Hash::make($validated['password']);
        }

        $staff->update($data);
        $staff->refresh();

        ActivityLogger::log(
            module: 'employee',
            action: 'updated',
            description: 'Updated employee "' . $staff->name . '".',
            subject: $staff,
            properties: [
                'employee_id' => $staff->id,
                'name' => $staff->name,
                'role' => $staff->role,
                'is_active' => (bool) $staff->is_active,
                'password_changed' => $passwordChanged,
            ],
            tenantId: $tenantId,
            branchId: $branchId
        );

        return back()->with('success', 'Staff updated successfully.');
    }

    public function destroy(User $staff)
    {
        $branch = $this->authorizeStaff($staff);

        $tenantId = (int) $branch->tenant_id;
        $branchId = (int) $branch->id;

        $staffId = $staff->id;
        $staffName = $staff->name;
        $staffRole = $staff->role;
        $isActive = (bool) $staff->is_active;

        ActivityLogger::log(
            module: 'employee',
            action: 'deleted',
            description: 'Deleted employee "' . $staffName . '".',
            subject: $staff,
            properties: [
                'employee_id' => $staffId,
                'name' => $staffName,
                'role' => $staffRole,
                'is_active' => $isActive,
            ],
            tenantId: $tenantId,
            branchId: $branchId
        );

        $staff->delete();

        return back()->with('success', 'Staff deleted successfully.');
    }

    public function toggleStatus(User $staff)
    {
        $branch = $this->authorizeStaff($staff);

        $tenantId = (int) $branch->tenant_id;
        $branchId = (int) $branch->id;

        $newStatus = !(bool) $staff->is_active;

        $staff->update([
            'is_active' => $newStatus,
        ]);

        $staff->refresh();

        ActivityLogger::log(
            module: 'employee',
            action: $newStatus ? 'activated' : 'deactivated',
            description: ($newStatus ? 'Activated' : 'Deactivated') . ' employee "' . $staff->name . '".',
            subject: $staff,
            properties: [
                'employee_id' => $staff->id,
                'name' => $staff->name,
                'role' => $staff->role,
                'is_active' => (bool) $staff->is_active,
            ],
            tenantId: $tenantId,
            branchId: $branchId
        );

        return back()->with('success', 'Staff status updated successfully.');
    }

    private function authorizeStaff(User $staff): Branch
    {
        $branch = $this->managerBranch();

        abort_if((int) $staff->created_by !== (int) $branch->tenant_id, 403);
        abort_if((int) $staff->branch_id !== (int) $branch->id, 403);
        abort_if(!in_array($staff->role, ['cashier', 'staff'], true), 403);

        return $branch;
    }
}