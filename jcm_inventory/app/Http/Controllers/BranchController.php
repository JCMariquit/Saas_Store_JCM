<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class BranchController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Branch List
    |--------------------------------------------------------------------------
    */

    public function index(Request $request): Response
    {
        $tenantId = $this->getTenantId($request);

        $search = trim(
            (string) $request->input('search', '')
        );

        $status = trim(
            (string) $request->input('status', '')
        );

        $branches = Branch::query()
            ->forTenant($tenantId)
            ->withCount('warehouses')
            ->search($search)
            ->when(
                $status === 'active',
                fn (Builder $query) => $query->where(
                    'is_active',
                    true
                )
            )
            ->when(
                $status === 'inactive',
                fn (Builder $query) => $query->where(
                    'is_active',
                    false
                )
            )
            ->orderByDesc('is_main')
            ->orderByDesc('is_active')
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        $summaryQuery = Branch::query()
            ->forTenant($tenantId);

        return Inertia::render('locations/branches/index', [
            'branches' => $branches,

            'summary' => [
                'total' => (clone $summaryQuery)
                    ->count(),

                'active' => (clone $summaryQuery)
                    ->where('is_active', true)
                    ->count(),

                'inactive' => (clone $summaryQuery)
                    ->where('is_active', false)
                    ->count(),

                'main' => (clone $summaryQuery)
                    ->where('is_main', true)
                    ->count(),
            ],

            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Create Branch
    |--------------------------------------------------------------------------
    */

    public function store(Request $request): RedirectResponse
    {
        $tenantId = $this->getTenantId($request);

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:180',
            ],

            'code' => [
                'required',
                'string',
                'max:50',

                Rule::unique('branches', 'code')
                    ->where(
                        fn ($query) => $query
                            ->where('tenant_id', $tenantId)
                            ->whereNull('deleted_at')
                    ),
            ],

            'address' => [
                'nullable',
                'string',
                'max:255',
            ],

            'phone' => [
                'nullable',
                'string',
                'max:50',
            ],

            'email' => [
                'nullable',
                'email',
                'max:180',
            ],

            'is_main' => [
                'required',
                'boolean',
            ],

            'is_active' => [
                'required',
                'boolean',
            ],
        ]);

        DB::connection('mysql')->transaction(
            function () use (
                $request,
                $tenantId,
                $validated
            ): void {
                $hasExistingBranch = Branch::query()
                    ->forTenant($tenantId)
                    ->exists();

                /*
                 * The first branch automatically becomes
                 * the main and active branch.
                 */
                $isMain = ! $hasExistingBranch
                    || (bool) $validated['is_main'];

                /*
                 * A main branch cannot be inactive.
                 */
                $isActive = $isMain
                    ? true
                    : (bool) $validated['is_active'];

                /*
                 * Only one main branch per tenant.
                 */
                if ($isMain) {
                    Branch::query()
                        ->forTenant($tenantId)
                        ->where('is_main', true)
                        ->update([
                            'is_main' => false,
                        ]);
                }

                Branch::query()->create([
                    'tenant_id' => $tenantId,

                    'name' => trim(
                        $validated['name']
                    ),

                    'code' => Str::upper(
                        trim($validated['code'])
                    ),

                    'address' => $this->nullableString(
                        $validated['address'] ?? null
                    ),

                    'phone' => $this->nullableString(
                        $validated['phone'] ?? null
                    ),

                    'email' => $this->nullableEmail(
                        $validated['email'] ?? null
                    ),

                    'is_main' => $isMain,
                    'is_active' => $isActive,

                    /*
                     * SaaS user ID.
                     * No cross-database foreign key.
                     */
                    'created_by' => $request->user()->id,
                ]);
            }
        );

        return back()->with(
            'success',
            'Branch created successfully.'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Update Branch
    |--------------------------------------------------------------------------
    */

    public function update(
        Request $request,
        Branch $branch
    ): RedirectResponse {
        $tenantId = $this->getTenantId($request);

        $this->ensureBranchBelongsToTenant(
            $branch,
            $tenantId
        );

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:180',
            ],

            'code' => [
                'required',
                'string',
                'max:50',

                Rule::unique('branches', 'code')
                    ->ignore($branch->id)
                    ->where(
                        fn ($query) => $query
                            ->where('tenant_id', $tenantId)
                            ->whereNull('deleted_at')
                    ),
            ],

            'address' => [
                'nullable',
                'string',
                'max:255',
            ],

            'phone' => [
                'nullable',
                'string',
                'max:50',
            ],

            'email' => [
                'nullable',
                'email',
                'max:180',
            ],

            'is_main' => [
                'required',
                'boolean',
            ],

            'is_active' => [
                'required',
                'boolean',
            ],
        ]);

        $requestedMain = (bool) $validated['is_main'];

        /*
         * Main branch must always be active.
         */
        $requestedActive = $requestedMain
            ? true
            : (bool) $validated['is_active'];

        $replacementMainBranch = null;

        /*
         * When the existing main branch will no longer
         * be main, another active branch must replace it.
         */
        if (
            $branch->is_main
            && (
                ! $requestedMain
                || ! $requestedActive
            )
        ) {
            $replacementMainBranch = Branch::query()
                ->forTenant($tenantId)
                ->where('id', '!=', $branch->id)
                ->where('is_active', true)
                ->orderBy('id')
                ->first();

            if (! $replacementMainBranch) {
                throw ValidationException::withMessages([
                    'is_main' => 'Create or activate another branch before removing this as the main branch.',
                ]);
            }
        }

        DB::connection('mysql')->transaction(
            function () use (
                $tenantId,
                $branch,
                $validated,
                $requestedMain,
                $requestedActive,
                $replacementMainBranch
            ): void {
                /*
                 * Remove the main flag from other branches
                 * when this branch becomes the new main.
                 */
                if ($requestedMain) {
                    Branch::query()
                        ->forTenant($tenantId)
                        ->where('id', '!=', $branch->id)
                        ->where('is_main', true)
                        ->update([
                            'is_main' => false,
                        ]);
                }

                $branch->update([
                    'name' => trim(
                        $validated['name']
                    ),

                    'code' => Str::upper(
                        trim($validated['code'])
                    ),

                    'address' => $this->nullableString(
                        $validated['address'] ?? null
                    ),

                    'phone' => $this->nullableString(
                        $validated['phone'] ?? null
                    ),

                    'email' => $this->nullableEmail(
                        $validated['email'] ?? null
                    ),

                    'is_main' => $requestedMain,
                    'is_active' => $requestedActive,
                ]);

                /*
                 * Promote another active branch when the
                 * previous main branch loses its main status.
                 */
                if ($replacementMainBranch) {
                    $replacementMainBranch->update([
                        'is_main' => true,
                        'is_active' => true,
                    ]);
                }
            }
        );

        return back()->with(
            'success',
            'Branch updated successfully.'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Update Branch Status
    |--------------------------------------------------------------------------
    */

    public function updateStatus(
        Request $request,
        Branch $branch
    ): RedirectResponse {
        $tenantId = $this->getTenantId($request);

        $this->ensureBranchBelongsToTenant(
            $branch,
            $tenantId
        );

        $validated = $request->validate([
            'is_active' => [
                'required',
                'boolean',
            ],
        ]);

        $newStatus = (bool) $validated['is_active'];

        $replacementMainBranch = null;

        /*
         * Main branch cannot be deactivated unless another
         * active branch is available to replace it.
         */
        if (
            $branch->is_main
            && ! $newStatus
        ) {
            $replacementMainBranch = Branch::query()
                ->forTenant($tenantId)
                ->where('id', '!=', $branch->id)
                ->where('is_active', true)
                ->orderBy('id')
                ->first();

            if (! $replacementMainBranch) {
                throw ValidationException::withMessages([
                    'is_active' => 'The only active main branch cannot be deactivated.',
                ]);
            }
        }

        DB::connection('mysql')->transaction(
            function () use (
                $branch,
                $newStatus,
                $replacementMainBranch
            ): void {
                $branch->update([
                    'is_active' => $newStatus,

                    /*
                     * Inactive branches cannot remain main.
                     */
                    'is_main' => $newStatus
                        ? $branch->is_main
                        : false,
                ]);

                if ($replacementMainBranch) {
                    $replacementMainBranch->update([
                        'is_main' => true,
                        'is_active' => true,
                    ]);
                }
            }
        );

        return back()->with(
            'success',
            $newStatus
                ? 'Branch activated successfully.'
                : 'Branch deactivated successfully.'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Delete Branch
    |--------------------------------------------------------------------------
    */

    public function destroy(
        Request $request,
        Branch $branch
    ): RedirectResponse {
        $tenantId = $this->getTenantId($request);

        $this->ensureBranchBelongsToTenant(
            $branch,
            $tenantId
        );

        /*
         * Branch cannot be deleted when it still
         * contains warehouse records.
         */
        if ($branch->warehouses()->exists()) {
            return back()->with(
                'error',
                'This branch cannot be deleted because it has warehouses.'
            );
        }

        $replacementMainBranch = null;

        /*
         * When deleting the main branch, promote another
         * branch. Active branches are prioritized.
         */
        if ($branch->is_main) {
            $replacementMainBranch = Branch::query()
                ->forTenant($tenantId)
                ->where('id', '!=', $branch->id)
                ->orderByDesc('is_active')
                ->orderBy('id')
                ->first();
        }

        DB::connection('mysql')->transaction(
            function () use (
                $branch,
                $replacementMainBranch
            ): void {
                /*
                 * Soft delete through the Branch model.
                 */
                $branch->delete();

                if ($replacementMainBranch) {
                    $replacementMainBranch->update([
                        'is_main' => true,
                        'is_active' => true,
                    ]);
                }
            }
        );

        return back()->with(
            'success',
            'Branch deleted successfully.'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    private function getTenantId(Request $request): int
    {
        $tenantId = (int) ($request->user()->client_id ?? 0);

        /*
        * Development fallback tenant.
        * Kapag wala pang client_id ang logged-in user,
        * tenant_id 1 muna ang gagamitin.
        */
        if ($tenantId <= 0 && app()->environment('local')) {
            return 1;
        }

        abort_if(
            $tenantId <= 0,
            403,
            'Your account is not assigned to a client.'
        );

        return $tenantId;
    }

    private function ensureBranchBelongsToTenant(
        Branch $branch,
        int $tenantId
    ): void {
        abort_unless(
            (int) $branch->tenant_id === $tenantId,
            404
        );
    }

    private function nullableString(
        mixed $value
    ): ?string {
        $value = trim((string) $value);

        return $value !== ''
            ? $value
            : null;
    }

    private function nullableEmail(
        mixed $value
    ): ?string {
        $value = trim((string) $value);

        return $value !== ''
            ? Str::lower($value)
            : null;
    }
}