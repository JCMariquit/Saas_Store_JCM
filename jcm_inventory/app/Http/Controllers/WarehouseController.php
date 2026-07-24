<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Warehouse;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class WarehouseController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Display Warehouses
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

        $branchId = (int) $request->input('branch_id', 0);

        $warehouses = Warehouse::query()
            ->where('tenant_id', $tenantId)
            ->with([
                'branch:id,name,code,is_active',
            ])
            ->withCount([
                'stocks',
                'stockMovements',
            ])
            ->when(
                $search !== '',
                function (Builder $query) use ($search): void {
                    $query->where(
                        function (Builder $query) use ($search): void {
                            $query
                                ->where('name', 'like', "%{$search}%")
                                ->orWhere('code', 'like', "%{$search}%")
                                ->orWhere('address', 'like', "%{$search}%")
                                ->orWhere(
                                    'contact_person',
                                    'like',
                                    "%{$search}%"
                                )
                                ->orWhere('phone', 'like', "%{$search}%");
                        }
                    );
                }
            )
            ->when(
                $branchId > 0,
                fn (Builder $query) => $query->where(
                    'branch_id',
                    $branchId
                )
            )
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

        $summaryQuery = Warehouse::query()
            ->where('tenant_id', $tenantId);

        $branches = Branch::query()
            ->where('tenant_id', $tenantId)
            ->select([
                'id',
                'name',
                'code',
                'is_main',
                'is_active',
            ])
            ->orderByDesc('is_main')
            ->orderByDesc('is_active')
            ->orderBy('name')
            ->get();

        return Inertia::render('locations/warehouses/index', [
            'warehouses' => $warehouses,

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

                'branch_id' => $branchId > 0
                    ? $branchId
                    : null,
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Create Warehouse
    |--------------------------------------------------------------------------
    */

    public function store(Request $request): RedirectResponse
    {
        $tenantId = $this->getTenantId($request);

        $validated = $request->validate([
            'branch_id' => [
                'required',
                'integer',

                Rule::exists('branches', 'id')
                    ->where(
                        fn ($query) => $query
                            ->where('tenant_id', $tenantId)
                            ->whereNull('deleted_at')
                    ),
            ],

            'name' => [
                'required',
                'string',
                'max:180',
            ],

            'code' => [
                'required',
                'string',
                'max:50',

                Rule::unique('warehouses', 'code')
                    ->where(
                        fn ($query) => $query
                            ->where('tenant_id', $tenantId)
                            ->where(
                                'branch_id',
                                (int) $request->input('branch_id')
                            )
                            ->whereNull('deleted_at')
                    ),
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'address' => [
                'nullable',
                'string',
                'max:255',
            ],

            'contact_person' => [
                'nullable',
                'string',
                'max:180',
            ],

            'phone' => [
                'nullable',
                'string',
                'max:50',
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

        $branchId = (int) $validated['branch_id'];

        DB::connection('mysql')->transaction(
            function () use (
                $request,
                $tenantId,
                $branchId,
                $validated
            ): void {
                $hasExistingWarehouse = Warehouse::query()
                    ->where('tenant_id', $tenantId)
                    ->where('branch_id', $branchId)
                    ->exists();

                /*
                 * The first warehouse under a branch
                 * automatically becomes the main warehouse.
                 */
                $isMain = ! $hasExistingWarehouse
                    || (bool) $validated['is_main'];

                /*
                 * Main warehouse must always be active.
                 */
                $isActive = $isMain
                    ? true
                    : (bool) $validated['is_active'];

                /*
                 * Only one main warehouse per branch.
                 */
                if ($isMain) {
                    Warehouse::query()
                        ->where('tenant_id', $tenantId)
                        ->where('branch_id', $branchId)
                        ->where('is_main', true)
                        ->update([
                            'is_main' => false,
                        ]);
                }

                Warehouse::query()->create([
                    'tenant_id' => $tenantId,
                    'branch_id' => $branchId,

                    'name' => trim(
                        $validated['name']
                    ),

                    'code' => Str::upper(
                        trim($validated['code'])
                    ),

                    'description' => $this->nullableString(
                        $validated['description'] ?? null
                    ),

                    'address' => $this->nullableString(
                        $validated['address'] ?? null
                    ),

                    'contact_person' => $this->nullableString(
                        $validated['contact_person'] ?? null
                    ),

                    'phone' => $this->nullableString(
                        $validated['phone'] ?? null
                    ),

                    'is_main' => $isMain,
                    'is_active' => $isActive,

                    /*
                     * User ID from the SaaS database.
                     */
                    'created_by' => $request->user()?->id,
                ]);
            }
        );

        return back()->with(
            'success',
            'Warehouse created successfully.'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Update Warehouse
    |--------------------------------------------------------------------------
    */

    public function update(
        Request $request,
        Warehouse $warehouse
    ): RedirectResponse {
        $tenantId = $this->getTenantId($request);

        $this->ensureWarehouseBelongsToTenant(
            $warehouse,
            $tenantId
        );

        $validated = $request->validate([
            'branch_id' => [
                'required',
                'integer',

                Rule::exists('branches', 'id')
                    ->where(
                        fn ($query) => $query
                            ->where('tenant_id', $tenantId)
                            ->whereNull('deleted_at')
                    ),
            ],

            'name' => [
                'required',
                'string',
                'max:180',
            ],

            'code' => [
                'required',
                'string',
                'max:50',

                Rule::unique('warehouses', 'code')
                    ->ignore($warehouse->id)
                    ->where(
                        fn ($query) => $query
                            ->where('tenant_id', $tenantId)
                            ->where(
                                'branch_id',
                                (int) $request->input('branch_id')
                            )
                            ->whereNull('deleted_at')
                    ),
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'address' => [
                'nullable',
                'string',
                'max:255',
            ],

            'contact_person' => [
                'nullable',
                'string',
                'max:180',
            ],

            'phone' => [
                'nullable',
                'string',
                'max:50',
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

        $oldBranchId = (int) $warehouse->branch_id;
        $newBranchId = (int) $validated['branch_id'];

        $isMovingToAnotherBranch =
            $oldBranchId !== $newBranchId;

        $targetBranchHasOtherWarehouses = Warehouse::query()
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $newBranchId)
            ->where('id', '!=', $warehouse->id)
            ->exists();

        /*
         * If this will be the only warehouse in the target
         * branch, it automatically becomes the main warehouse.
         */
        $isMain = ! $targetBranchHasOtherWarehouses
            || (bool) $validated['is_main'];

        $isActive = $isMain
            ? true
            : (bool) $validated['is_active'];

        $replacementWarehouse = null;

        /*
         * Find a replacement when the current warehouse
         * will lose its main status in the old branch.
         */
        if (
            $warehouse->is_main
            && (
                $isMovingToAnotherBranch
                || ! $isMain
                || ! $isActive
            )
        ) {
            $replacementWarehouse = Warehouse::query()
                ->where('tenant_id', $tenantId)
                ->where('branch_id', $oldBranchId)
                ->where('id', '!=', $warehouse->id)
                ->orderByDesc('is_active')
                ->orderBy('id')
                ->first();

            /*
             * When staying in the same branch, the only
             * warehouse cannot lose its main status.
             */
            if (
                ! $isMovingToAnotherBranch
                && ! $replacementWarehouse
            ) {
                throw ValidationException::withMessages([
                    'is_main' => 'The only warehouse in a branch must remain the active main warehouse.',
                ]);
            }
        }

        DB::connection('mysql')->transaction(
            function () use (
                $tenantId,
                $warehouse,
                $validated,
                $newBranchId,
                $isMain,
                $isActive,
                $replacementWarehouse
            ): void {
                /*
                 * Remove main status from the other warehouses
                 * in the new or current branch.
                 */
                if ($isMain) {
                    Warehouse::query()
                        ->where('tenant_id', $tenantId)
                        ->where('branch_id', $newBranchId)
                        ->where('id', '!=', $warehouse->id)
                        ->where('is_main', true)
                        ->update([
                            'is_main' => false,
                        ]);
                }

                $warehouse->update([
                    'branch_id' => $newBranchId,

                    'name' => trim(
                        $validated['name']
                    ),

                    'code' => Str::upper(
                        trim($validated['code'])
                    ),

                    'description' => $this->nullableString(
                        $validated['description'] ?? null
                    ),

                    'address' => $this->nullableString(
                        $validated['address'] ?? null
                    ),

                    'contact_person' => $this->nullableString(
                        $validated['contact_person'] ?? null
                    ),

                    'phone' => $this->nullableString(
                        $validated['phone'] ?? null
                    ),

                    'is_main' => $isMain,
                    'is_active' => $isActive,
                ]);

                /*
                 * Promote another warehouse in the old branch.
                 */
                if ($replacementWarehouse) {
                    $replacementWarehouse->update([
                        'is_main' => true,
                        'is_active' => true,
                    ]);
                }
            }
        );

        return back()->with(
            'success',
            'Warehouse updated successfully.'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Update Warehouse Status
    |--------------------------------------------------------------------------
    */

    public function updateStatus(
        Request $request,
        Warehouse $warehouse
    ): RedirectResponse {
        $tenantId = $this->getTenantId($request);

        $this->ensureWarehouseBelongsToTenant(
            $warehouse,
            $tenantId
        );

        $validated = $request->validate([
            'is_active' => [
                'required',
                'boolean',
            ],
        ]);

        $isActive = (bool) $validated['is_active'];

        $replacementWarehouse = null;

        /*
         * Main warehouse cannot be deactivated unless another
         * active warehouse can replace it.
         */
        if (
            $warehouse->is_main
            && ! $isActive
        ) {
            $replacementWarehouse = Warehouse::query()
                ->where('tenant_id', $tenantId)
                ->where('branch_id', $warehouse->branch_id)
                ->where('id', '!=', $warehouse->id)
                ->where('is_active', true)
                ->orderBy('id')
                ->first();

            if (! $replacementWarehouse) {
                throw ValidationException::withMessages([
                    'is_active' => 'The only active main warehouse cannot be deactivated.',
                ]);
            }
        }

        DB::connection('mysql')->transaction(
            function () use (
                $tenantId,
                $warehouse,
                $isActive,
                $replacementWarehouse
            ): void {
                $isMain = $warehouse->is_main;

                /*
                 * If the branch currently has no main
                 * warehouse, an activated warehouse becomes main.
                 */
                if ($isActive && ! $isMain) {
                    $hasMainWarehouse = Warehouse::query()
                        ->where('tenant_id', $tenantId)
                        ->where(
                            'branch_id',
                            $warehouse->branch_id
                        )
                        ->where('id', '!=', $warehouse->id)
                        ->where('is_main', true)
                        ->exists();

                    if (! $hasMainWarehouse) {
                        $isMain = true;
                    }
                }

                $warehouse->update([
                    'is_active' => $isActive,

                    'is_main' => $isActive
                        ? $isMain
                        : false,
                ]);

                if ($replacementWarehouse) {
                    $replacementWarehouse->update([
                        'is_main' => true,
                        'is_active' => true,
                    ]);
                }
            }
        );

        return back()->with(
            'success',
            $isActive
                ? 'Warehouse activated successfully.'
                : 'Warehouse deactivated successfully.'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Delete Warehouse
    |--------------------------------------------------------------------------
    */

    public function destroy(
        Request $request,
        Warehouse $warehouse
    ): RedirectResponse {
        $tenantId = $this->getTenantId($request);

        $this->ensureWarehouseBelongsToTenant(
            $warehouse,
            $tenantId
        );

        /*
         * Do not delete a warehouse that already has
         * product stock records.
         */
        if ($warehouse->stocks()->exists()) {
            return back()->with(
                'error',
                'This warehouse cannot be deleted because it contains stock records.'
            );
        }

        /*
         * Preserve movement history.
         */
        if ($warehouse->stockMovements()->exists()) {
            return back()->with(
                'error',
                'This warehouse cannot be deleted because it has stock movement history.'
            );
        }

        $replacementWarehouse = null;

        if ($warehouse->is_main) {
            $replacementWarehouse = Warehouse::query()
                ->where('tenant_id', $tenantId)
                ->where('branch_id', $warehouse->branch_id)
                ->where('id', '!=', $warehouse->id)
                ->orderByDesc('is_active')
                ->orderBy('id')
                ->first();
        }

        DB::connection('mysql')->transaction(
            function () use (
                $warehouse,
                $replacementWarehouse
            ): void {
                /*
                 * Soft delete.
                 */
                $warehouse->delete();

                if ($replacementWarehouse) {
                    $replacementWarehouse->update([
                        'is_main' => true,
                        'is_active' => true,
                    ]);
                }
            }
        );

        return back()->with(
            'success',
            'Warehouse deleted successfully.'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    private function getTenantId(
        Request $request
    ): int {
        $tenantId = (int) (
            $request->user()?->client_id ?? 0
        );

        /*
         * Temporary tenant while developing locally.
         */
        if (
            $tenantId <= 0
            && app()->environment('local')
        ) {
            return 1;
        }

        abort_if(
            $tenantId <= 0,
            403,
            'Your account is not assigned to a client.'
        );

        return $tenantId;
    }

    private function ensureWarehouseBelongsToTenant(
        Warehouse $warehouse,
        int $tenantId
    ): void {
        abort_unless(
            (int) $warehouse->tenant_id === $tenantId,
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
}