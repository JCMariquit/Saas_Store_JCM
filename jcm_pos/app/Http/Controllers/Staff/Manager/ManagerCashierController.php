<?php

namespace App\Http\Controllers\Staff\Manager;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ManagerCashierController extends Controller
{
    private function managerBranch(): Branch
    {
        $branchId = auth()->user()->branch_id;

        abort_if(!$branchId, 403, 'No branch assigned to this manager.');

        return Branch::query()
            ->where('id', $branchId)
            ->where('is_active', true)
            ->firstOrFail(['id', 'tenant_id', 'name', 'code', 'is_main', 'is_active']);
    }

    public function index(Request $request)
    {
        $branch = $this->managerBranch();
        $tenantId = (int) $branch->tenant_id;
        $branchId = (int) $branch->id;

        $cashiers = User::query()
            ->where('created_by', $tenantId)
            ->where('branch_id', $branchId)
            ->where('role', 'cashier')
            ->when($request->search, function ($query, $search) {
                $query->where(function ($subQuery) use ($search) {
                    $subQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('username', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->get([
                'id',
                'created_by',
                'branch_id',
                'name',
                'email',
                'phone',
                'username',
                'role',
                'is_active',
                'created_at',
                'updated_at',
            ]);

        return Inertia::render('staff/manager/cashiers/index', [
            'cashiers' => $cashiers,
            'branch' => $branch,
            'filters' => [
                'search' => $request->search,
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
            'email' => ['required', 'email', 'max:180', Rule::unique('users', 'email')],
            'phone' => ['nullable', 'string', 'max:50'],
            'password' => ['required', 'string', 'min:8'],
            'is_active' => ['boolean'],
        ]);

        User::create([
            'created_by' => $tenantId,
            'branch_id' => $branchId,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'username' => $this->makeUsername($validated['name'], $validated['email']),
            'password' => Hash::make($validated['password']),
            'role' => 'cashier',
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return back()->with('success', 'Cashier created successfully.');
    }

    public function update(Request $request, User $cashier)
    {
        $branch = $this->managerBranch();

        abort_if((int) $cashier->created_by !== (int) $branch->tenant_id, 403);
        abort_if((int) $cashier->branch_id !== (int) $branch->id, 403);
        abort_if($cashier->role !== 'cashier', 403);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:180'],
            'email' => ['required', 'email', 'max:180', Rule::unique('users', 'email')->ignore($cashier->id)],
            'phone' => ['nullable', 'string', 'max:50'],
            'password' => ['nullable', 'string', 'min:8'],
            'is_active' => ['boolean'],
        ]);

        $data = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ];

        if (!empty($validated['password'])) {
            $data['password'] = Hash::make($validated['password']);
        }

        $cashier->update($data);

        return back()->with('success', 'Cashier updated successfully.');
    }

    public function destroy(User $cashier)
    {
        $branch = $this->managerBranch();

        abort_if((int) $cashier->created_by !== (int) $branch->tenant_id, 403);
        abort_if((int) $cashier->branch_id !== (int) $branch->id, 403);
        abort_if($cashier->role !== 'cashier', 403);

        $cashier->delete();

        return back()->with('success', 'Cashier deleted successfully.');
    }

    public function toggleStatus(User $cashier)
    {
        $branch = $this->managerBranch();

        abort_if((int) $cashier->created_by !== (int) $branch->tenant_id, 403);
        abort_if((int) $cashier->branch_id !== (int) $branch->id, 403);
        abort_if($cashier->role !== 'cashier', 403);

        $cashier->update([
            'is_active' => !$cashier->is_active,
        ]);

        return back()->with('success', 'Cashier status updated successfully.');
    }

    private function makeUsername(string $name, string $email): string
    {
        $base = str($name)
            ->lower()
            ->replaceMatches('/[^a-z0-9]+/', '.')
            ->trim('.')
            ->toString();

        if (!$base) {
            $base = str($email)->before('@')->lower()->toString();
        }

        $username = $base;
        $counter = 1;

        while (User::query()->where('username', $username)->exists()) {
            $username = $base . $counter;
            $counter++;
        }

        return $username;
    }
}