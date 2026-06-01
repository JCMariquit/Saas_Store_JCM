<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\StoreProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class StoreProfileController extends Controller
{
    public function index(Request $request)
    {
        $clientId = auth()->id();

        $branches = Branch::query()
            ->where('tenant_id', $clientId)
            ->orderByDesc('is_main')
            ->orderBy('name')
            ->get(['id', 'tenant_id', 'name', 'code', 'is_main', 'is_active', 'created_at', 'updated_at']);

        if ($branches->isEmpty()) {
            return Inertia::render('owner/management/store-profile/index', [
                'profile' => null,
                'branches' => [],
                'selected_branch' => null,
                'selected_branch_id' => null,
                'logo_url' => null,
                'cover_url' => null,
            ]);
        }

        $selectedBranchId = $request->integer('branch_id');

        $selectedBranch = $branches->firstWhere('id', $selectedBranchId)
            ?? $branches->firstWhere('is_main', true)
            ?? $branches->first();

        $profile = StoreProfile::query()
            ->where('client_id', $clientId)
            ->where('branch_id', $selectedBranch->id)
            ->first();

        abort_if(
            !$profile,
            404,
            'Store profile not found for this branch. Create the branch again or run a backfill for old branches.'
        );

        $branchItems = $branches->map(function (Branch $branch) use ($clientId) {
            $profile = StoreProfile::query()
                ->where('client_id', $clientId)
                ->where('branch_id', $branch->id)
                ->first();

            return $this->formatBranch($branch, $profile);
        });

        return Inertia::render('owner/management/store-profile/index', [
            'profile' => [
                ...$profile->toArray(),
                'logo_url' => $this->publicUrl($profile->logo_path),
                'cover_url' => $this->publicUrl($profile->cover_path),
            ],
            'branches' => $branchItems->values(),
            'selected_branch' => $this->formatBranch($selectedBranch, $profile),
            'selected_branch_id' => $selectedBranch->id,
            'logo_url' => $this->publicUrl($profile->logo_path),
            'cover_url' => $this->publicUrl($profile->cover_path),
        ]);
    }

    public function update(Request $request)
    {
        $clientId = auth()->id();

        $validated = $request->validate([
            'branch_id' => [
                'required',
                Rule::exists('pos.branches', 'id')
                    ->where(fn ($query) => $query->where('tenant_id', $clientId)),
            ],

            'store_name' => ['required', 'string', 'max:255'],
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

            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:3072'],
            'cover' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        $branch = Branch::query()
            ->where('tenant_id', $clientId)
            ->where('id', $validated['branch_id'])
            ->firstOrFail();

        $profile = StoreProfile::query()
            ->where('client_id', $clientId)
            ->where('branch_id', $branch->id)
            ->firstOrFail();

        $payload = [
            'store_name' => $validated['store_name'],
            'business_type' => $validated['business_type'] ?? null,
            'description' => $validated['description'] ?? null,
            'email' => $validated['email'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'address_line' => $validated['address_line'] ?? null,
            'barangay' => $validated['barangay'] ?? null,
            'city' => $validated['city'] ?? null,
            'province' => $validated['province'] ?? null,
            'postal_code' => $validated['postal_code'] ?? null,
            'country' => $validated['country'],
            'tin' => $validated['tin'] ?? null,
            'permit_no' => $validated['permit_no'] ?? null,
            'currency' => $validated['currency'],
            'timezone' => $validated['timezone'],
            'receipt_header' => $validated['receipt_header'] ?? null,
            'receipt_footer' => $validated['receipt_footer'] ?? null,
            'is_active' => true,
        ];

        if ($request->hasFile('logo')) {
            $this->deletePublicFile($profile->logo_path);

            $payload['logo_path'] = $request
                ->file('logo')
                ->store('store-profiles/logos', 'public');
        }

        if ($request->hasFile('cover')) {
            $this->deletePublicFile($profile->cover_path);

            $payload['cover_path'] = $request
                ->file('cover')
                ->store('store-profiles/covers', 'public');
        }

        $profile->update($payload);

        return redirect()
            ->route('client.management.store-profile.index', [
                'branch_id' => $branch->id,
            ])
            ->with('success', 'Store profile updated successfully.');
    }

    private function formatBranch(Branch $branch, ?StoreProfile $profile = null): array
    {
        return [
            'id' => $branch->id,
            'tenant_id' => $branch->tenant_id,
            'name' => $branch->name,
            'code' => $branch->code,
            'is_main' => (bool) $branch->is_main,
            'is_active' => (bool) $branch->is_active,

            'profile_id' => $profile?->id,
            'store_name' => $profile?->store_name ?? $branch->name,
            'business_type' => $profile?->business_type,
            'description' => $profile?->description,
            'email' => $profile?->email,
            'phone' => $profile?->phone,

            'address_line' => $profile?->address_line,
            'barangay' => $profile?->barangay,
            'city' => $profile?->city,
            'province' => $profile?->province,
            'postal_code' => $profile?->postal_code,
            'country' => $profile?->country ?? 'Philippines',

            'tin' => $profile?->tin,
            'permit_no' => $profile?->permit_no,

            'currency' => $profile?->currency ?? 'PHP',
            'timezone' => $profile?->timezone ?? 'Asia/Manila',

            'receipt_header' => $profile?->receipt_header,
            'receipt_footer' => $profile?->receipt_footer,

            'logo_path' => $profile?->logo_path,
            'cover_path' => $profile?->cover_path,
            'logo_url' => $this->publicUrl($profile?->logo_path),
            'cover_url' => $this->publicUrl($profile?->cover_path),

            'updated_at' => $profile?->updated_at?->toDateTimeString()
                ?? optional($branch->updated_at)->toDateTimeString(),
        ];
    }

    private function publicUrl(?string $path): ?string
    {
        return $path ? Storage::disk('public')->url($path) : null;
    }

    private function deletePublicFile(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }
}