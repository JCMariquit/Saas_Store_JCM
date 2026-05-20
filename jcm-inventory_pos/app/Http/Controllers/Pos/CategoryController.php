<?php

namespace App\Http\Controllers\Pos;

use App\Http\Controllers\Controller;
use App\Models\Pos\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CategoryController extends Controller
{
    private function tenantId(): int
    {
        return auth()->id();
    }

    public function index(Request $request)
    {
        $tenantId = $this->tenantId();

        $categories = Category::query()
            ->where('tenant_id', $tenantId)
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('pos/inventory/categories/index', [
            'categories' => $categories,
            'filters' => [
                'search' => $request->search,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $tenantId = $this->tenantId();

        $validated = $request->validate([
            'parent_id' => ['nullable', 'integer'],
            'name' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer'],
            'status' => ['required', 'in:active,inactive'],
        ]);

        Category::create([
            ...$validated,
            'tenant_id' => $tenantId,
            'slug' => Str::slug($validated['name']),
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        return back()->with('success', 'Category created successfully.');
    }

    public function update(Request $request, Category $category)
    {
        abort_if($category->tenant_id !== $this->tenantId(), 403);

        $validated = $request->validate([
            'parent_id' => ['nullable', 'integer'],
            'name' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer'],
            'status' => ['required', 'in:active,inactive'],
        ]);

        $category->update([
            ...$validated,
            'slug' => Str::slug($validated['name']),
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        return back()->with('success', 'Category updated successfully.');
    }

    public function destroy(Category $category)
    {
        abort_if($category->tenant_id !== $this->tenantId(), 403);

        $category->delete();

        return back()->with('success', 'Category deleted successfully.');
    }
}