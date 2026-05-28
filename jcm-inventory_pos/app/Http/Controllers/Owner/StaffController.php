<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Staff;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
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
            ->get([
                'id',
                'name',
                'code',
                'is_main',
            ]);

        $staff = Staff::query()
            ->where('tenant_id', $clientId)
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search')->toString();

                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('username', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->get([
                'id',
                'tenant_id',
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

        return Inertia::render('owner/management/staff/index', [
            'staff' => $staff,
            'branches' => $branches,
            'filters' => [
                'search' => $request->input('search', ''),
            ],
            'categories' => [
                [
                    'value' => 'cashier',
                    'label' => 'Cashier',
                ],
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
                Rule::unique('pos.staff', 'email')
                    ->where(fn ($query) => $query->where('tenant_id', $clientId)),
            ],

            'password' => ['required', 'string', 'min:8'],

            'branch_id' => [
                'required',
                Rule::exists('pos.branches', 'id')
                    ->where(fn ($query) => $query->where('tenant_id', $clientId)),
            ],
        ]);

        Staff::create([
            'tenant_id' => $clientId,
            'branch_id' => $validated['branch_id'],
            'name' => $validated['name'],
            'email' => $validated['email'],
            'username' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'cashier',
            'is_active' => 1,
        ]);

        return back()->with('success', 'Staff added successfully.');
    }

    public function update(Request $request, Staff $staff)
    {
        $this->authorizeStaff($staff);

        $clientId = auth()->id();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],

            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('pos.staff', 'email')
                    ->where(fn ($query) => $query->where('tenant_id', $clientId))
                    ->ignore($staff->id),
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
            'username' => $validated['email'],
            'is_active' => $validated['is_active'],
        ];

        if (!empty($validated['password'])) {
            $payload['password'] = Hash::make($validated['password']);
        }

        $staff->update($payload);

        return back()->with('success', 'Staff updated successfully.');
    }

    public function destroy(Staff $staff)
    {
        $this->authorizeStaff($staff);

        $staff->delete();

        return back()->with('success', 'Staff deleted successfully.');
    }

    public function toggleStatus(Staff $staff)
    {
        $this->authorizeStaff($staff);

        $staff->update([
            'is_active' => ! $staff->is_active,
        ]);

        return back()->with('success', 'Staff status updated successfully.');
    }

    private function authorizeStaff(Staff $staff): void
    {
        abort_if(
            (int) $staff->tenant_id !== (int) auth()->id(),
            403,
            'Unauthorized staff access.'
        );
    }
}