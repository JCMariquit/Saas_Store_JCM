<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $tenantId = $this->getTenantId($request);

        $search = trim(
            (string) $request->input('search', '')
        );

        $status = trim(
            (string) $request->input('status', '')
        );

        $parentId = trim(
            (string) $request->input('parent_id', '')
        );

        $categories = Category::query()
            ->where('tenant_id', $tenantId)
            ->with([
                'parent:id,name,slug',
            ])
            ->withCount([
                'products',
                'children',
            ])
            ->when(
                $search !== '',
                function (Builder $query) use ($search): void {
                    $query->where(
                        function (Builder $query) use ($search): void {
                            $query
                                ->where('name', 'like', "%{$search}%")
                                ->orWhere('slug', 'like', "%{$search}%")
                                ->orWhere(
                                    'description',
                                    'like',
                                    "%{$search}%"
                                );
                        }
                    );
                }
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
            ->when(
                $parentId === 'root',
                fn (Builder $query) => $query->whereNull(
                    'parent_id'
                )
            )
            ->when(
                ctype_digit($parentId),
                fn (Builder $query) => $query->where(
                    'parent_id',
                    (int) $parentId
                )
            )
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate(12)
            ->withQueryString();

        $summaryQuery = Category::query()
            ->where('tenant_id', $tenantId);

        $parentCategories = Category::query()
            ->where('tenant_id', $tenantId)
            ->select([
                'id',
                'parent_id',
                'name',
                'slug',
                'is_active',
                'sort_order',
            ])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return Inertia::render(
            'inventory/categories/index',
            [
                'categories' => $categories,

                'parentCategories' => $parentCategories,

                'summary' => [
                    'total' => (clone $summaryQuery)
                        ->count(),

                    'active' => (clone $summaryQuery)
                        ->where('is_active', true)
                        ->count(),

                    'inactive' => (clone $summaryQuery)
                        ->where('is_active', false)
                        ->count(),

                    'root' => (clone $summaryQuery)
                        ->whereNull('parent_id')
                        ->count(),
                ],

                'filters' => [
                    'search' => $search,
                    'status' => $status,
                    'parent_id' => $parentId,
                ],
            ]
        );
    }

    public function store(Request $request): RedirectResponse
    {
        $tenantId = $this->getTenantId($request);

        $validated = $request->validate([
            'parent_id' => [
                'nullable',
                'integer',

                Rule::exists('categories', 'id')
                    ->where(
                        fn ($query) => $query
                            ->where('tenant_id', $tenantId)
                            ->whereNull('deleted_at')
                    ),
            ],

            'name' => [
                'required',
                'string',
                'max:150',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'sort_order' => [
                'required',
                'integer',
                'min:0',
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
                $name = trim($validated['name']);

                Category::query()->create([
                    'tenant_id' => $tenantId,

                    'parent_id' => filled(
                        $validated['parent_id'] ?? null
                    )
                        ? (int) $validated['parent_id']
                        : null,

                    'name' => $name,

                    'slug' => $this->createUniqueSlug(
                        $name,
                        $tenantId
                    ),

                    'description' => $this->nullableString(
                        $validated['description'] ?? null
                    ),

                    'sort_order' => (int) $validated['sort_order'],

                    'is_active' => (bool) $validated['is_active'],

                    'created_by' => $request->user()?->id,
                ]);
            }
        );

        return back()->with(
            'success',
            'Category created successfully.'
        );
    }

    public function update(
        Request $request,
        Category $category
    ): RedirectResponse {
        $tenantId = $this->getTenantId($request);

        $this->ensureCategoryBelongsToTenant(
            $category,
            $tenantId
        );

        $validated = $request->validate([
            'parent_id' => [
                'nullable',
                'integer',

                Rule::notIn([
                    $category->id,
                ]),

                Rule::exists('categories', 'id')
                    ->where(
                        fn ($query) => $query
                            ->where('tenant_id', $tenantId)
                            ->whereNull('deleted_at')
                    ),
            ],

            'name' => [
                'required',
                'string',
                'max:150',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'sort_order' => [
                'required',
                'integer',
                'min:0',
            ],

            'is_active' => [
                'required',
                'boolean',
            ],
        ]);

        $parentId = filled(
            $validated['parent_id'] ?? null
        )
            ? (int) $validated['parent_id']
            : null;

        if (
            $this->createsParentCycle(
                $category,
                $parentId,
                $tenantId
            )
        ) {
            throw ValidationException::withMessages([
                'parent_id' => 'The selected parent category creates a circular relationship.',
            ]);
        }

        DB::connection('mysql')->transaction(
            function () use (
                $category,
                $tenantId,
                $validated,
                $parentId
            ): void {
                $name = trim($validated['name']);

                $category->update([
                    'parent_id' => $parentId,

                    'name' => $name,

                    'slug' => $this->createUniqueSlug(
                        $name,
                        $tenantId,
                        $category->id
                    ),

                    'description' => $this->nullableString(
                        $validated['description'] ?? null
                    ),

                    'sort_order' => (int) $validated['sort_order'],

                    'is_active' => (bool) $validated['is_active'],
                ]);
            }
        );

        return back()->with(
            'success',
            'Category updated successfully.'
        );
    }

    public function updateStatus(
        Request $request,
        Category $category
    ): RedirectResponse {
        $tenantId = $this->getTenantId($request);

        $this->ensureCategoryBelongsToTenant(
            $category,
            $tenantId
        );

        $validated = $request->validate([
            'is_active' => [
                'required',
                'boolean',
            ],
        ]);

        $isActive = (bool) $validated['is_active'];

        $category->update([
            'is_active' => $isActive,
        ]);

        return back()->with(
            'success',
            $isActive
                ? 'Category activated successfully.'
                : 'Category deactivated successfully.'
        );
    }

    public function destroy(
        Request $request,
        Category $category
    ): RedirectResponse {
        $tenantId = $this->getTenantId($request);

        $this->ensureCategoryBelongsToTenant(
            $category,
            $tenantId
        );

        if ($category->children()->exists()) {
            return back()->with(
                'error',
                'This category cannot be deleted because it has subcategories.'
            );
        }

        if ($category->products()->exists()) {
            return back()->with(
                'error',
                'This category cannot be deleted because it has products.'
            );
        }

        $category->delete();

        return back()->with(
            'success',
            'Category deleted successfully.'
        );
    }

    private function getTenantId(Request $request): int
    {
        $tenantId = (int) (
            $request->user()?->client_id ?? 0
        );

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

    private function ensureCategoryBelongsToTenant(
        Category $category,
        int $tenantId
    ): void {
        abort_unless(
            (int) $category->tenant_id === $tenantId,
            404
        );
    }

    private function createUniqueSlug(
        string $name,
        int $tenantId,
        ?int $ignoreCategoryId = null
    ): string {
        $baseSlug = Str::slug($name);

        if ($baseSlug === '') {
            $baseSlug = 'category';
        }

        $slug = $baseSlug;
        $counter = 2;

        while (
            Category::withTrashed()
                ->where('tenant_id', $tenantId)
                ->where('slug', $slug)
                ->when(
                    $ignoreCategoryId !== null,
                    fn (Builder $query) => $query->where(
                        'id',
                        '!=',
                        $ignoreCategoryId
                    )
                )
                ->exists()
        ) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        return $slug;
    }

    private function createsParentCycle(
        Category $category,
        ?int $parentId,
        int $tenantId
    ): bool {
        if ($parentId === null) {
            return false;
        }

        if ($parentId === $category->id) {
            return true;
        }

        $visitedIds = [];
        $currentParentId = $parentId;

        while ($currentParentId !== null) {
            if ($currentParentId === $category->id) {
                return true;
            }

            if (
                in_array(
                    $currentParentId,
                    $visitedIds,
                    true
                )
            ) {
                return true;
            }

            $visitedIds[] = $currentParentId;

            $currentParentId = Category::query()
                ->where('tenant_id', $tenantId)
                ->whereKey($currentParentId)
                ->value('parent_id');
        }

        return false;
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