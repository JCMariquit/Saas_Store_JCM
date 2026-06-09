<?php

namespace App\Http\Controllers\Staff\Manager;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Category;
use App\Support\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ManagerCategoryController extends Controller
{
    private function managerBranch(): Branch
    {
        $user = auth()->user();

        abort_if(!$user->branch_id, 403, 'No branch assigned to this manager.');
        abort_if(!$user->client_id, 403, 'No client assigned to this manager.');

        return Branch::query()
            ->where('id', $user->branch_id)
            ->where('tenant_id', $user->client_id)
            ->where('is_active', true)
            ->firstOrFail(['id', 'tenant_id', 'name', 'code', 'is_main', 'is_active']);
    }

    public function index(Request $request)
    {
        $branch = $this->managerBranch();
        $filters = $this->filters($request);

        $categories = Category::query()
            ->where('tenant_id', $branch->tenant_id)
            ->where('branch_id', $branch->id)
            ->when($filters['search'], function ($query, $search) {
                $query->where(function ($subQuery) use ($search) {
                    $subQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($filters['status'], fn ($query, $status) => $query->where('status', $status))
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('staff/manager/categories/index', [
            'categories' => $categories,
            'branch' => $branch,
            'filters' => $filters,
        ]);
    }

    public function store(Request $request)
    {
        $branch = $this->managerBranch();

        $tenantId = (int) $branch->tenant_id;
        $branchId = (int) $branch->id;

        $validated = $request->validate($this->rules($tenantId, $branchId));

        $category = Category::create([
            ...$validated,
            'tenant_id' => $tenantId,
            'branch_id' => $branchId,
            'slug' => Str::slug($validated['name']),
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        ActivityLogger::log(
            module: 'categories',
            action: 'created',
            description: 'Created category "' . $category->name . '".',
            subject: $category,
            properties: [
                'category_id' => $category->id,
                'name' => $category->name,
                'status' => $category->status,
            ],
            tenantId: $tenantId,
            branchId: $branchId
        );

        return back()->with('success', 'Category created successfully.');
    }

    public function update(Request $request, Category $category)
    {
        $branch = $this->managerBranch();

        $this->authorizeCategory($category, $branch);

        $tenantId = (int) $branch->tenant_id;
        $branchId = (int) $branch->id;

        $validated = $request->validate($this->rules(
            $tenantId,
            $branchId,
            (int) $category->id
        ));

        $category->update([
            ...$validated,
            'slug' => Str::slug($validated['name']),
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        $category->refresh();

        ActivityLogger::log(
            module: 'categories',
            action: 'updated',
            description: 'Updated category "' . $category->name . '".',
            subject: $category,
            properties: [
                'category_id' => $category->id,
                'name' => $category->name,
                'status' => $category->status,
            ],
            tenantId: $tenantId,
            branchId: $branchId
        );

        return back()->with('success', 'Category updated successfully.');
    }

    public function destroy(Category $category)
    {
        $branch = $this->managerBranch();

        $this->authorizeCategory($category, $branch);

        $tenantId = (int) $branch->tenant_id;
        $branchId = (int) $branch->id;

        $categoryId = $category->id;
        $categoryName = $category->name;
        $categoryStatus = $category->status;

        ActivityLogger::log(
            module: 'categories',
            action: 'deleted',
            description: 'Deleted category "' . $categoryName . '".',
            subject: $category,
            properties: [
                'category_id' => $categoryId,
                'name' => $categoryName,
                'status' => $categoryStatus,
            ],
            tenantId: $tenantId,
            branchId: $branchId
        );

        $category->delete();

        return back()->with('success', 'Category deleted successfully.');
    }

    private function filters(Request $request): array
    {
        return [
            'search' => trim((string) $request->input('search', '')),
            'status' => $request->input('status'),
        ];
    }

    private function authorizeCategory(Category $category, Branch $branch): void
    {
        abort_if((int) $category->tenant_id !== (int) $branch->tenant_id, 403);
        abort_if((int) $category->branch_id !== (int) $branch->id, 403);
    }

    private function rules(int $tenantId, int $branchId, ?int $ignoreId = null): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:120',
                Rule::unique('pos.categories', 'name')
                    ->where(fn ($query) => $query
                        ->where('tenant_id', $tenantId)
                        ->where('branch_id', $branchId))
                    ->ignore($ignoreId),
            ],
            'description' => ['nullable', 'string'],
            'status' => ['required', 'in:active,inactive'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}