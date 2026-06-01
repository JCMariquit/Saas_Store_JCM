<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\StoreProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class BranchController extends Controller
{
    public function index(Request $request)
    {
        $clientId = auth()->id();

        $branches = Branch::query()
            ->where('tenant_id', $clientId)
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search')->toString();

                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%");
                });
            })
            ->with('storeProfile')
            ->orderByDesc('is_main')
            ->latest()
            ->get();

        return Inertia::render('owner/management/branches/index', [
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
            'name' => ['required', 'string', 'max:180'],
            'code' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('pos.branches', 'code')
                    ->where(fn ($query) => $query->where('tenant_id', $clientId)),
            ],
            'is_main' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $branch = DB::connection('pos')->transaction(function () use ($validated, $clientId) {
            $isMain = (bool) ($validated['is_main'] ?? false);

            if ($isMain) {
                Branch::query()
                    ->where('tenant_id', $clientId)
                    ->update(['is_main' => false]);
            }

            $branch = Branch::create([
                'tenant_id' => $clientId,
                'name' => $validated['name'],
                'code' => $validated['code'] ?? null,
                'is_main' => $isMain,
                'is_active' => (bool) ($validated['is_active'] ?? true),
            ]);

            $this->createDefaultStoreProfile($branch);

            return $branch;
        });

        return redirect()
            ->route('client.management.store-profile.index', [
                'branch_id' => $branch->id,
            ])
            ->with('success', 'Branch created successfully. You can now update its store profile.');
    }

    public function update(Request $request, Branch $branch)
    {
        $this->authorizeBranch($branch);

        $clientId = auth()->id();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:180'],
            'code' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('pos.branches', 'code')
                    ->where(fn ($query) => $query->where('tenant_id', $clientId))
                    ->ignore($branch->id),
            ],
            'is_main' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        DB::connection('pos')->transaction(function () use ($validated, $clientId, $branch) {
            $isMain = (bool) ($validated['is_main'] ?? false);

            if ($isMain) {
                Branch::query()
                    ->where('tenant_id', $clientId)
                    ->where('id', '!=', $branch->id)
                    ->update(['is_main' => false]);
            }

            $branch->update([
                'name' => $validated['name'],
                'code' => $validated['code'] ?? null,
                'is_main' => $isMain,
                'is_active' => (bool) ($validated['is_active'] ?? true),
            ]);

            $profile = StoreProfile::query()
                ->where('client_id', $clientId)
                ->where('branch_id', $branch->id)
                ->first();

            if (!$profile) {
                $this->createDefaultStoreProfile($branch);
            } elseif (!$profile->store_name) {
                $profile->update([
                    'store_name' => $branch->name,
                ]);
            }
        });

        return back()->with('success', 'Branch updated successfully.');
    }

    public function destroy(Branch $branch)
    {
        $this->authorizeBranch($branch);

        abort_if($branch->is_main, 422, 'Main branch cannot be deleted.');

        DB::connection('pos')->transaction(function () use ($branch) {
            StoreProfile::query()
                ->where('client_id', auth()->id())
                ->where('branch_id', $branch->id)
                ->delete();

            $branch->delete();
        });

        return back()->with('success', 'Branch deleted successfully.');
    }

    public function toggleStatus(Branch $branch)
    {
        $this->authorizeBranch($branch);

        abort_if($branch->is_main && $branch->is_active, 422, 'Main branch cannot be deactivated.');

        $branch->update([
            'is_active' => ! $branch->is_active,
        ]);

        return back()->with('success', 'Branch status updated successfully.');
    }

    private function createDefaultStoreProfile(Branch $branch): StoreProfile
    {
        return StoreProfile::firstOrCreate(
            [
                'client_id' => $branch->tenant_id,
                'branch_id' => $branch->id,
            ],
            [
                'store_name' => $branch->name,
                'country' => 'Philippines',
                'currency' => 'PHP',
                'timezone' => 'Asia/Manila',
                'is_active' => true,
            ]
        );
    }

    private function authorizeBranch(Branch $branch): void
    {
        abort_if((int) $branch->tenant_id !== (int) auth()->id(), 403);
    }
}