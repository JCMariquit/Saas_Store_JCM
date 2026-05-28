<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class StaffController extends Controller
{
    public function index(Request $request)
    {
        $clientId = auth()->id();

        $staff = User::query()
            ->where('role', 'cashier')
            ->where('client_id', $clientId)
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
                'name',
                'email',
                'role',
                'client_id',
                'created_by',
                'is_active',
                'created_at',
                'updated_at',
            ]);

        return Inertia::render('owner/management/staff/index', [
            'staff' => $staff,
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
                Rule::unique('users', 'email'),
            ],
            'password' => ['required', 'string', 'min:8'],
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'cashier',
            'client_id' => $clientId,
            'created_by' => $clientId,
            'is_active' => 1,
        ]);

        return back()->with('success', 'Staff added successfully.');
    }

    public function update(Request $request, User $staff)
    {
        $this->authorizeStaff($staff);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($staff->id),
            ],
            'is_active' => ['required', 'boolean'],
            'password' => ['nullable', 'string', 'min:8'],
        ]);

        $payload = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'is_active' => $validated['is_active'],
        ];

        if (!empty($validated['password'])) {
            $payload['password'] = Hash::make($validated['password']);
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
            $staff->role !== 'cashier' || (int) $staff->client_id !== (int) auth()->id(),
            403,
            'Unauthorized staff access.'
        );
    }
}