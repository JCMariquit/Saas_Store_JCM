<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SupplierController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Supplier List
    |--------------------------------------------------------------------------
    */

    public function index(Request $request): Response
    {
        $tenantId = $this->getTenantId($request);

        /*
        |--------------------------------------------------------------------------
        | Filters
        |--------------------------------------------------------------------------
        */

        $search = trim(
            (string) $request->input('search', '')
        );

        $status = trim(
            (string) $request->input('status', '')
        );

        $sort = trim(
            (string) $request->input(
                'sort',
                'latest'
            )
        );

        $allowedSorts = [
            'latest',
            'oldest',
            'name_asc',
            'name_desc',
            'code_asc',
            'code_desc',
        ];

        if (! in_array($sort, $allowedSorts, true)) {
            $sort = 'latest';
        }

        /*
        |--------------------------------------------------------------------------
        | Supplier Query
        |--------------------------------------------------------------------------
        */

        $supplierQuery = Supplier::query()
            ->where(
                'suppliers.tenant_id',
                $tenantId
            )

            ->when(
                $search !== '',
                function ($query) use ($search): void {
                    $query->where(
                        function ($searchQuery) use (
                            $search
                        ): void {
                            $like = "%{$search}%";

                            $searchQuery
                                ->where(
                                    'suppliers.code',
                                    'like',
                                    $like
                                )
                                ->orWhere(
                                    'suppliers.name',
                                    'like',
                                    $like
                                )
                                ->orWhere(
                                    'suppliers.contact_person',
                                    'like',
                                    $like
                                )
                                ->orWhere(
                                    'suppliers.email',
                                    'like',
                                    $like
                                )
                                ->orWhere(
                                    'suppliers.phone',
                                    'like',
                                    $like
                                )
                                ->orWhere(
                                    'suppliers.alternate_phone',
                                    'like',
                                    $like
                                )
                                ->orWhere(
                                    'suppliers.address',
                                    'like',
                                    $like
                                )
                                ->orWhere(
                                    'suppliers.tax_number',
                                    'like',
                                    $like
                                );
                        }
                    );
                }
            )

            ->when(
                $status === 'active',
                fn ($query) => $query->where(
                    'suppliers.is_active',
                    true
                )
            )

            ->when(
                $status === 'inactive',
                fn ($query) => $query->where(
                    'suppliers.is_active',
                    false
                )
            )

            ->select([
                'suppliers.id',
                'suppliers.tenant_id',
                'suppliers.code',
                'suppliers.name',
                'suppliers.contact_person',
                'suppliers.email',
                'suppliers.phone',
                'suppliers.alternate_phone',
                'suppliers.address',
                'suppliers.tax_number',
                'suppliers.payment_terms',
                'suppliers.credit_limit',
                'suppliers.notes',
                'suppliers.is_active',
                'suppliers.created_by',
                'suppliers.created_at',
                'suppliers.updated_at',
            ]);

        /*
        |--------------------------------------------------------------------------
        | Sorting
        |--------------------------------------------------------------------------
        */

        match ($sort) {
            'oldest' => $supplierQuery
                ->orderBy('suppliers.created_at')
                ->orderBy('suppliers.id'),

            'name_asc' => $supplierQuery
                ->orderBy('suppliers.name')
                ->orderBy('suppliers.id'),

            'name_desc' => $supplierQuery
                ->orderByDesc('suppliers.name')
                ->orderByDesc('suppliers.id'),

            'code_asc' => $supplierQuery
                ->orderBy('suppliers.code')
                ->orderBy('suppliers.id'),

            'code_desc' => $supplierQuery
                ->orderByDesc('suppliers.code')
                ->orderByDesc('suppliers.id'),

            default => $supplierQuery
                ->orderByDesc('suppliers.created_at')
                ->orderByDesc('suppliers.id'),
        };

        $suppliers = $supplierQuery
            ->paginate(15)
            ->withQueryString();

        /*
        |--------------------------------------------------------------------------
        | Get SaaS User Names
        |--------------------------------------------------------------------------
        |
        | created_by contains an ID from jcm_saas_db.users.
        | Walang cross-database foreign key.
        |
        */

        $creatorIds = $suppliers
            ->getCollection()
            ->pluck('created_by')
            ->filter()
            ->map(
                fn ($userId): int => (int) $userId
            )
            ->unique()
            ->values();

        $creators = $creatorIds->isEmpty()
            ? collect()
            : DB::connection('saas')
                ->table('users')
                ->whereIn('id', $creatorIds)
                ->get([
                    'id',
                    'name',
                    'email',
                ])
                ->keyBy('id');

        /*
        |--------------------------------------------------------------------------
        | Format Supplier Records
        |--------------------------------------------------------------------------
        */

        $suppliers->setCollection(
            $suppliers
                ->getCollection()
                ->map(
                    function (
                        Supplier $supplier
                    ) use ($creators): array {
                        $creator = $supplier->created_by
                            ? $creators->get(
                                (int) $supplier->created_by
                            )
                            : null;

                        return [
                            'id' => (int) $supplier->id,

                            'code' => $supplier->code,

                            'name' => $supplier->name,

                            'contact_person' =>
                                $supplier->contact_person,

                            'email' => $supplier->email,

                            'phone' => $supplier->phone,

                            'alternate_phone' =>
                                $supplier->alternate_phone,

                            'address' => $supplier->address,

                            'tax_number' =>
                                $supplier->tax_number,

                            'payment_terms' =>
                                $supplier->payment_terms,

                            'credit_limit' =>
                                (float) $supplier
                                    ->credit_limit,

                            'notes' => $supplier->notes,

                            'is_active' =>
                                (bool) $supplier->is_active,

                            'created_by' =>
                                $supplier->created_by
                                    ? [
                                        'id' => (int) $supplier
                                            ->created_by,

                                        'name' => $creator
                                            ->name
                                            ?? 'User #'
                                            .$supplier
                                                ->created_by,

                                        'email' => $creator
                                            ->email
                                            ?? null,
                                    ]
                                    : null,

                            'created_at' =>
                                $supplier->created_at
                                    ?->toISOString(),

                            'updated_at' =>
                                $supplier->updated_at
                                    ?->toISOString(),
                        ];
                    }
                )
        );

        /*
        |--------------------------------------------------------------------------
        | Summary
        |--------------------------------------------------------------------------
        */

        $summaryQuery = Supplier::query()
            ->where('tenant_id', $tenantId);

        $summary = [
            'total' => (clone $summaryQuery)
                ->count(),

            'active' => (clone $summaryQuery)
                ->where('is_active', true)
                ->count(),

            'inactive' => (clone $summaryQuery)
                ->where('is_active', false)
                ->count(),
        ];

        /*
        |--------------------------------------------------------------------------
        | Render Page
        |--------------------------------------------------------------------------
        */

        return Inertia::render(
            'procurement/suppliers/index',
            [
                'suppliers' => $suppliers,

                'summary' => $summary,

                'filters' => [
                    'search' => $search,
                    'status' => $status,
                    'sort' => $sort,
                ],
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Store Supplier
    |--------------------------------------------------------------------------
    */

    public function store(
        Request $request
    ): RedirectResponse {
        $tenantId = $this->getTenantId($request);

        $this->normalizeInput($request);

        $validated = $this->validateSupplier(
            request: $request,
            tenantId: $tenantId
        );

        $validated['tenant_id'] = $tenantId;

        $validated['code'] = $validated['code']
            ?? $this->generateSupplierCode(
                $tenantId
            );

        $validated['is_active'] =
            $request->has('is_active')
                ? $request->boolean('is_active')
                : true;

        $validated['created_by'] =
            $request->user()->id;

        Supplier::query()->create($validated);

        return back()->with(
            'success',
            'Supplier created successfully.'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Update Supplier
    |--------------------------------------------------------------------------
    */

    public function update(
        Request $request,
        Supplier $supplier
    ): RedirectResponse {
        $tenantId = $this->getTenantId($request);

        $this->ensureTenantOwnership(
            supplier: $supplier,
            tenantId: $tenantId
        );

        $this->normalizeInput($request);

        $validated = $this->validateSupplier(
            request: $request,
            tenantId: $tenantId,
            supplier: $supplier
        );

        /*
         * Kapag binura sa form ang code,
         * keep the existing supplier code.
         */
        $validated['code'] = $validated['code']
            ?? $supplier->code;

        if ($request->has('is_active')) {
            $validated['is_active'] =
                $request->boolean('is_active');
        } else {
            unset($validated['is_active']);
        }

        $supplier->update($validated);

        return back()->with(
            'success',
            'Supplier updated successfully.'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Update Supplier Status
    |--------------------------------------------------------------------------
    */

    public function updateStatus(
        Request $request,
        Supplier $supplier
    ): RedirectResponse {
        $tenantId = $this->getTenantId($request);

        $this->ensureTenantOwnership(
            supplier: $supplier,
            tenantId: $tenantId
        );

        $validated = $request->validate([
            'is_active' => [
                'required',
                'boolean',
            ],
        ]);

        $supplier->update([
            'is_active' =>
                (bool) $validated['is_active'],
        ]);

        return back()->with(
            'success',
            $supplier->is_active
                ? 'Supplier activated successfully.'
                : 'Supplier deactivated successfully.'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Delete Supplier
    |--------------------------------------------------------------------------
    */

    public function destroy(
        Request $request,
        Supplier $supplier
    ): RedirectResponse {
        $tenantId = $this->getTenantId($request);

        $this->ensureTenantOwnership(
            supplier: $supplier,
            tenantId: $tenantId
        );

        /*
         * Soft delete muna.
         *
         * Kapag ginawa na ang purchase_orders table,
         * maglalagay tayo rito ng restriction kapag
         * may existing purchase transactions.
         */
        $supplier->delete();

        return back()->with(
            'success',
            'Supplier deleted successfully.'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Validation
    |--------------------------------------------------------------------------
    */

    private function validateSupplier(
        Request $request,
        int $tenantId,
        ?Supplier $supplier = null
    ): array {
        $codeRule = Rule::unique(
            'suppliers',
            'code'
        )->where(
            fn ($query) => $query->where(
                'tenant_id',
                $tenantId
            )
        );

        if ($supplier !== null) {
            $codeRule->ignore($supplier->id);
        }

        return $request->validate([
            'code' => [
                'nullable',
                'string',
                'max:50',
                $codeRule,
            ],

            'name' => [
                'required',
                'string',
                'max:180',
            ],

            'contact_person' => [
                'nullable',
                'string',
                'max:180',
            ],

            'email' => [
                'nullable',
                'email',
                'max:180',
            ],

            'phone' => [
                'nullable',
                'string',
                'max:50',
            ],

            'alternate_phone' => [
                'nullable',
                'string',
                'max:50',
            ],

            'address' => [
                'nullable',
                'string',
                'max:1000',
            ],

            'tax_number' => [
                'nullable',
                'string',
                'max:100',
            ],

            'payment_terms' => [
                'nullable',
                'string',
                'max:100',
            ],

            'credit_limit' => [
                'nullable',
                'numeric',
                'min:0',
                'max:999999999999.99',
            ],

            'notes' => [
                'nullable',
                'string',
                'max:5000',
            ],

            'is_active' => [
                'sometimes',
                'boolean',
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Normalize Supplier Input
    |--------------------------------------------------------------------------
    */

    private function normalizeInput(
        Request $request
    ): void {
        $code = trim(
            (string) $request->input('code', '')
        );

        $name = trim(
            (string) $request->input('name', '')
        );

        $request->merge([
            'code' => $code !== ''
                ? Str::upper($code)
                : null,

            'name' => $name,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Generate Supplier Code
    |--------------------------------------------------------------------------
    */

    private function generateSupplierCode(
        int $tenantId
    ): string {
        do {
            $code = 'SUP-'.Str::upper(
                Str::random(8)
            );

            $exists = Supplier::query()
                ->where('tenant_id', $tenantId)
                ->where('code', $code)
                ->exists();
        } while ($exists);

        return $code;
    }

    /*
    |--------------------------------------------------------------------------
    | Tenant Ownership
    |--------------------------------------------------------------------------
    */

    private function ensureTenantOwnership(
        Supplier $supplier,
        int $tenantId
    ): void {
        abort_if(
            (int) $supplier->tenant_id !== $tenantId,
            404
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Tenant Helper
    |--------------------------------------------------------------------------
    */

    private function getTenantId(
        Request $request
    ): int {
        $tenantId = (int) (
            $request->user()->client_id ?? 0
        );

        /*
         * Temporary local development fallback.
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
}