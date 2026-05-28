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
        $profile = $this->getOrCreateProfile();

        $branches = Branch::query()
            ->where('tenant_id', auth()->id())
            ->orderByDesc('is_main')
            ->orderBy('name')
            ->get()
            ->map(function (Branch $branch) {
                return [
                    ...$branch->toArray(),
                    'logo_url' => $this->publicUrl($branch->logo_path),
                    'cover_url' => $this->publicUrl($branch->cover_path),
                ];
            });

        if ($branches->isEmpty()) {
            $mainBranch = $this->getOrCreateMainBranch($profile);

            $branches = collect([
                [
                    ...$mainBranch->toArray(),
                    'logo_url' => $this->publicUrl($mainBranch->logo_path),
                    'cover_url' => $this->publicUrl($mainBranch->cover_path),
                ],
            ]);
        }

        $selectedBranchId = $request->integer('branch_id');

        $selectedBranch = $branches->firstWhere('id', $selectedBranchId)
            ?? $branches->firstWhere('is_main', true)
            ?? $branches->first();

        return Inertia::render('owner/management/store-profile/index', [
            'profile' => $profile,
            'branches' => $branches->values(),
            'selected_branch' => $selectedBranch,
            'selected_branch_id' => $selectedBranch['id'] ?? null,
            'logo_url' => $this->publicUrl($profile->logo_path),
            'cover_url' => $this->publicUrl($profile->cover_path),
        ]);
    }

    public function update(Request $request)
    {
        $profile = $this->getOrCreateProfile();

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

        $profilePayload = [
            'store_name' => $validated['store_name'],
            'business_type' => $validated['business_type'] ?? null,
            'description' => $validated['description'] ?? null,
            'email' => $validated['email'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'tin' => $validated['tin'] ?? null,
            'permit_no' => $validated['permit_no'] ?? null,
            'currency' => $validated['currency'],
            'timezone' => $validated['timezone'],
            'receipt_header' => $validated['receipt_header'] ?? null,
            'receipt_footer' => $validated['receipt_footer'] ?? null,
            'country' => $validated['country'],
        ];

        $branchPayload = [
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
        ];

        if ($branch->is_main) {
            $branchPayload['name'] = $validated['store_name'];
        }

        if ($request->hasFile('logo')) {
            if ($branch->is_main) {
                $this->deletePublicFile($profile->logo_path);

                $profilePayload['logo_path'] = $request
                    ->file('logo')
                    ->store('store/logos', 'public');

                $branchPayload['logo_path'] = $profilePayload['logo_path'];
            } else {
                $this->deletePublicFile($branch->logo_path);

                $branchPayload['logo_path'] = $request
                    ->file('logo')
                    ->store('branches/logos', 'public');
            }
        }

        if ($request->hasFile('cover')) {
            if ($branch->is_main) {
                $this->deletePublicFile($profile->cover_path);

                $profilePayload['cover_path'] = $request
                    ->file('cover')
                    ->store('store/covers', 'public');

                $branchPayload['cover_path'] = $profilePayload['cover_path'];
            } else {
                $this->deletePublicFile($branch->cover_path);

                $branchPayload['cover_path'] = $request
                    ->file('cover')
                    ->store('branches/covers', 'public');
            }
        }

        if ($branch->is_main) {
            $profile->update($profilePayload);
        }

        $branch->update($branchPayload);

        return redirect()
            ->route('client.management.store-profile.index', [
                'branch_id' => $branch->id,
            ])
            ->with('success', 'Store profile updated successfully.');
    }

    private function getOrCreateProfile(): StoreProfile
    {
        return StoreProfile::firstOrCreate(
            [
                'client_id' => auth()->id(),
            ],
            [
                'store_name' => auth()->user()->name . "'s Store",
                'country' => 'Philippines',
                'currency' => 'PHP',
                'timezone' => 'Asia/Manila',
                'is_active' => true,
            ]
        );
    }

    private function getOrCreateMainBranch(StoreProfile $profile): Branch
    {
        return Branch::firstOrCreate(
            [
                'tenant_id' => auth()->id(),
                'code' => 'MAIN',
            ],
            [
                'name' => $profile->store_name ?: 'Main Branch',
                'business_type' => $profile->business_type,
                'description' => $profile->description,
                'email' => $profile->email,
                'phone' => $profile->phone,
                'address_line' => $profile->address_line,
                'barangay' => $profile->barangay,
                'city' => $profile->city,
                'province' => $profile->province,
                'postal_code' => $profile->postal_code,
                'country' => $profile->country ?: 'Philippines',
                'logo_path' => $profile->logo_path,
                'cover_path' => $profile->cover_path,
                'tin' => $profile->tin,
                'permit_no' => $profile->permit_no,
                'currency' => $profile->currency ?: 'PHP',
                'timezone' => $profile->timezone ?: 'Asia/Manila',
                'receipt_header' => $profile->receipt_header,
                'receipt_footer' => $profile->receipt_footer,
                'is_main' => true,
                'is_active' => true,
            ]
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