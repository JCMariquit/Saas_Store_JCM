<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class StaffController extends Controller
{
    public function index(Request $request)
    {
        $clientId = auth()->id();

        $branches = Branch::query()
            ->where('tenant_id', $clientId)
            ->where('is_active', true)
            ->orderByDesc('is_main')
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'is_main']);

        $staff = User::query()
            ->where('client_id', $clientId)
            ->where('system_used', 'pos')
            ->whereIn('role', ['cashier', 'staff', 'manager'])
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search')->toString();

                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->get([
                'id',
                'client_id',
                'branch_id',
                'system_used',
                'created_by',
                'name',
                'email',
                'role',
                'is_active',
                'created_at',
                'updated_at',
            ]);

        return Inertia::render('owner/management/staff/index', [
            'staff' => $staff,
            'branches' => $branches,
            'filters' => [
                'search' => $request->input('search', ''),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $clientId = auth()->id();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],

            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('saas.users', 'email'),
            ],

            'password' => ['required', 'string', 'min:8'],

            'branch_id' => [
                'required',
                Rule::exists('pos.branches', 'id')
                    ->where(fn ($query) => $query->where('tenant_id', $clientId)),
            ],
        ]);

        User::create([
            'client_id' => $clientId,
            'branch_id' => $validated['branch_id'],
            'system_used' => 'pos',
            'created_by' => auth()->id(),

            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'role' => 'cashier',
            'is_active' => true,
        ]);

        return back()->with('success', 'Staff added successfully.');
    }

    public function update(Request $request, User $staff)
    {
        $this->authorizeStaff($staff);

        $clientId = auth()->id();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],

            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('saas.users', 'email')->ignore($staff->id),
            ],

            'password' => ['nullable', 'string', 'min:8'],

            'branch_id' => [
                'required',
                Rule::exists('pos.branches', 'id')
                    ->where(fn ($query) => $query->where('tenant_id', $clientId)),
            ],

            'is_active' => ['required', 'boolean'],
        ]);

        $payload = [
            'branch_id' => $validated['branch_id'],
            'name' => $validated['name'],
            'email' => $validated['email'],
            'is_active' => $validated['is_active'],
        ];

        if (!empty($validated['password'])) {
            $payload['password'] = $validated['password'];
        }

        $staff->update($payload);

        return back()->with('success', 'Staff updated successfully.');
    }

    public function destroy(User $staff)
    {
        $this->authorizeStaff($staff);

        $staff->delete();

        return back()->with('success', 'Staff deleted successfully.');
    }

    public function toggleStatus(User $staff)
    {
        $this->authorizeStaff($staff);

        $staff->update([
            'is_active' => ! $staff->is_active,
        ]);

        return back()->with('success', 'Staff status updated successfully.');
    }

    private function authorizeStaff(User $staff): void
    {
        abort_if(
            (int) $staff->client_id !== (int) auth()->id()
            || $staff->system_used !== 'pos'
            || ! in_array($staff->role, ['cashier', 'staff', 'manager']),
            403,
            'Unauthorized staff access.'
        );
    }
}