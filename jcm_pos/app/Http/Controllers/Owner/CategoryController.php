<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CategoryController extends Controller
{
    private function tenantId(): int
    {
        $user = auth()->user();

        return (int) ($user->client_id ?: $user->id);
    }

    private function getSelectedBranchId(Request $request, int $tenantId): ?int
    {
        if ($request->filled('branch_id')) {
            $branchId = (int) $request->branch_id;

            return Branch::query()
                ->where('tenant_id', $tenantId)
                ->where('id', $branchId)
                ->exists()
                    ? $branchId
                    : null;
        }

        return Branch::query()
            ->where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderByDesc('is_main')
            ->orderBy('name')
            ->value('id');
    }

    public function index(Request $request)
    {
        $tenantId = $this->tenantId();
        $selectedBranchId = $this->getSelectedBranchId($request, $tenantId);

        $branches = Branch::query()
            ->where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderByDesc('is_main')
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'is_main', 'is_active']);

        $categories = Category::query()
            ->with([
                'branch:id,name,code',
                'parent:id,name',
            ])
            ->where('tenant_id', $tenantId)
            ->when($selectedBranchId, function ($query) use ($selectedBranchId) {
                $query->where('branch_id', $selectedBranchId);
            })
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->search;

                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        $parentCategories = Category::query()
            ->where('tenant_id', $tenantId)
            ->when($selectedBranchId, function ($query) use ($selectedBranchId) {
                $query->where('branch_id', $selectedBranchId);
            })
            ->where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('owner/inventory/categories/index', [
            'categories' => $categories,
            'parentCategories' => $parentCategories,
            'branches' => $branches,
            'selectedBranchId' => $selectedBranchId,
            'filters' => [
                'branch_id' => $selectedBranchId,
                'search' => $request->search,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $tenantId = $this->tenantId();

        $validated = $request->validate([
            'branch_id' => [
                'required',
                'integer',
                Rule::exists('pos.branches', 'id')->where(function ($query) use ($tenantId) {
                    $query->where('tenant_id', $tenantId);
                }),
            ],
            'parent_id' => [
                'nullable',
                'integer',
                Rule::exists('pos.categories', 'id')->where(function ($query) use ($tenantId, $request) {
                    $query->where('tenant_id', $tenantId);

                    if ($request->filled('branch_id')) {
                        $query->where('branch_id', $request->branch_id);
                    }
                }),
            ],
            'name' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer'],
            'status' => ['required', 'in:active,inactive'],
        ]);

        Category::create([
            'tenant_id' => $tenantId,
            'branch_id' => $validated['branch_id'],
            'parent_id' => $validated['parent_id'] ?? null,
            'name' => $validated['name'],
            'slug' => $this->generateUniqueSlug($validated['name'], $tenantId, (int) $validated['branch_id']),
            'description' => $validated['description'] ?? null,
            'sort_order' => $validated['sort_order'] ?? 0,
            'status' => $validated['status'],
        ]);

        return back()->with('success', 'Category created successfully.');
    }

    public function update(Request $request, Category $category)
    {
        abort_if((int) $category->tenant_id !== $this->tenantId(), 403);

        $tenantId = $this->tenantId();

        $validated = $request->validate([
            'branch_id' => [
                'required',
                'integer',
                Rule::exists('pos.branches', 'id')->where(function ($query) use ($tenantId) {
                    $query->where('tenant_id', $tenantId);
                }),
            ],
            'parent_id' => [
                'nullable',
                'integer',
                Rule::exists('pos.categories', 'id')->where(function ($query) use ($tenantId, $request, $category) {
                    $query->where('tenant_id', $tenantId)
                        ->where('id', '!=', $category->id);

                    if ($request->filled('branch_id')) {
                        $query->where('branch_id', $request->branch_id);
                    }
                }),
            ],
            'name' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer'],
            'status' => ['required', 'in:active,inactive'],
        ]);

        $category->update([
            'branch_id' => $validated['branch_id'],
            'parent_id' => $validated['parent_id'] ?? null,
            'name' => $validated['name'],
            'slug' => $this->generateUniqueSlug(
                $validated['name'],
                (int) $category->tenant_id,
                (int) $validated['branch_id'],
                $category->id
            ),
            'description' => $validated['description'] ?? null,
            'sort_order' => $validated['sort_order'] ?? 0,
            'status' => $validated['status'],
        ]);

        return back()->with('success', 'Category updated successfully.');
    }

    public function destroy(Category $category)
    {
        abort_if((int) $category->tenant_id !== $this->tenantId(), 403);

        $category->delete();

        return back()->with('success', 'Category deleted successfully.');
    }

    private function generateUniqueSlug(string $name, int $tenantId, int $branchId, ?int $ignoreId = null): string
    {
        $baseSlug = Str::slug($name) ?: 'category';
        $slug = $baseSlug;
        $counter = 1;

        while (
            Category::query()
                ->where('tenant_id', $tenantId)
                ->where('branch_id', $branchId)
                ->where('slug', $slug)
                ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }
}