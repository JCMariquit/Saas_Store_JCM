<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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
                        ->orWhere('code', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('city', 'like', "%{$search}%")
                        ->orWhere('province', 'like', "%{$search}%");
                });
            })
            ->orderByDesc('is_main')
            ->latest()
            ->get()
            ->map(function (Branch $branch) {
                return [
                    ...$branch->toArray(),
                    'logo_url' => $this->publicUrl($branch->logo_path),
                    'cover_url' => $this->publicUrl($branch->cover_path),
                ];
            });

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

            'business_type' => ['nullable', 'string', 'max:150'],
            'description' => ['nullable', 'string'],

            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],

            'address_line' => ['nullable', 'string', 'max:255'],
            'barangay' => ['nullable', 'string', 'max:150'],
            'city' => ['nullable', 'string', 'max:150'],
            'province' => ['nullable', 'string', 'max:150'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'country' => ['required', 'string', 'max:100'],

            'tin' => ['nullable', 'string', 'max:100'],
            'permit_no' => ['nullable', 'string', 'max:100'],

            'currency' => ['required', 'string', 'max:10'],
            'timezone' => ['required', 'string', 'max:100'],

            'receipt_header' => ['nullable', 'string'],
            'receipt_footer' => ['nullable', 'string'],

            'is_main' => ['required', 'boolean'],
            'is_active' => ['required', 'boolean'],

            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:3072'],
            'cover' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        if ($request->hasFile('logo')) {
            $validated['logo_path'] = $request
                ->file('logo')
                ->store('branches/logos', 'public');
        }

        if ($request->hasFile('cover')) {
            $validated['cover_path'] = $request
                ->file('cover')
                ->store('branches/covers', 'public');
        }

        unset($validated['logo'], $validated['cover']);

        if ((bool) $validated['is_main']) {
            Branch::query()
                ->where('tenant_id', $clientId)
                ->update(['is_main' => false]);
        }

        Branch::create([
            ...$validated,
            'tenant_id' => $clientId,
        ]);

        return back()->with('success', 'Branch created successfully.');
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

            'business_type' => ['nullable', 'string', 'max:150'],
            'description' => ['nullable', 'string'],

            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],

            'address_line' => ['nullable', 'string', 'max:255'],
            'barangay' => ['nullable', 'string', 'max:150'],
            'city' => ['nullable', 'string', 'max:150'],
            'province' => ['nullable', 'string', 'max:150'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'country' => ['required', 'string', 'max:100'],

            'tin' => ['nullable', 'string', 'max:100'],
            'permit_no' => ['nullable', 'string', 'max:100'],

            'currency' => ['required', 'string', 'max:10'],
            'timezone' => ['required', 'string', 'max:100'],

            'receipt_header' => ['nullable', 'string'],
            'receipt_footer' => ['nullable', 'string'],

            'is_main' => ['required', 'boolean'],
            'is_active' => ['required', 'boolean'],

            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:3072'],
            'cover' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        if ($request->hasFile('logo')) {
            $this->deletePublicFile($branch->logo_path);

            $validated['logo_path'] = $request
                ->file('logo')
                ->store('branches/logos', 'public');
        }

        if ($request->hasFile('cover')) {
            $this->deletePublicFile($branch->cover_path);

            $validated['cover_path'] = $request
                ->file('cover')
                ->store('branches/covers', 'public');
        }

        unset($validated['logo'], $validated['cover']);

        if ((bool) $validated['is_main']) {
            Branch::query()
                ->where('tenant_id', $clientId)
                ->where('id', '!=', $branch->id)
                ->update(['is_main' => false]);
        }

        $branch->update($validated);

        return back()->with('success', 'Branch updated successfully.');
    }

    public function destroy(Branch $branch)
    {
        $this->authorizeBranch($branch);

        abort_if(
            $branch->is_main,
            422,
            'Main branch cannot be deleted.'
        );

        $this->deletePublicFile($branch->logo_path);
        $this->deletePublicFile($branch->cover_path);

        $branch->delete();

        return back()->with('success', 'Branch deleted successfully.');
    }

    public function toggleStatus(Branch $branch)
    {
        $this->authorizeBranch($branch);

        abort_if(
            $branch->is_main && $branch->is_active,
            422,
            'Main branch cannot be deactivated.'
        );

        $branch->update([
            'is_active' => ! $branch->is_active,
        ]);

        return back()->with('success', 'Branch status updated successfully.');
    }

    private function authorizeBranch(Branch $branch): void
    {
        abort_if(
            (int) $branch->tenant_id !== (int) auth()->id(),
            403,
            'Unauthorized branch access.'
        );
    }

    private function publicUrl(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        return Storage::disk('public')->url($path);
    }

    private function deletePublicFile(?string $path): void
    {
        if (!$path) {
            return;
        }

        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }
}