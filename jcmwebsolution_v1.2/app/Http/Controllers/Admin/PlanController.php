<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PlanController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        $plans = Plan::with('product')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('plan_name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('status', 'like', "%{$search}%")
                        ->orWhereHas('product', function ($productQuery) use ($search) {
                            $productQuery->where('name', 'like', "%{$search}%");
                        });
                });
            })
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString()
            ->through(fn ($plan) => [
                'id' => $plan->id,
                'product_id' => $plan->product_id,
                'product_name' => $plan->product?->name,
                'plan_name' => $plan->plan_name,
                'price' => $plan->price,
                'duration_days' => $plan->duration_days,
                'description' => $plan->description,
                'status' => $plan->status,
                'created_at' => optional($plan->created_at)?->format('M d, Y h:i A'),
            ]);

        return Inertia::render('admin/plans/index', [
            'filters' => [
                'search' => $search,
            ],
            'plans' => $plans,
            'products' => Product::query()
                ->where('status', 'active')
                ->orderBy('name')
                ->get(['id', 'name']),
            'stats' => [
                'total_plans' => Plan::count(),
                'active_plans' => Plan::where('status', 'active')->count(),
                'inactive_plans' => Plan::where('status', 'inactive')->count(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'plan_name' => ['required', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0'],
            'duration_days' => ['required', 'integer', 'min:1'],
            'description' => ['nullable', 'string'],
            'status' => ['required', 'in:active,inactive'],
        ]);

        Plan::create([
            'product_id' => $validated['product_id'],
            'plan_name' => $validated['plan_name'],
            'price' => $validated['price'],
            'duration_days' => $validated['duration_days'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'],
        ]);

        return redirect()
            ->route('admin.plans.index')
            ->with('success', 'Plan created successfully.');
    }

    public function update(Request $request, Plan $plan): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'plan_name' => ['required', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0'],
            'duration_days' => ['required', 'integer', 'min:1'],
            'description' => ['nullable', 'string'],
            'status' => ['required', 'in:active,inactive'],
        ]);

        $plan->update([
            'product_id' => $validated['product_id'],
            'plan_name' => $validated['plan_name'],
            'price' => $validated['price'],
            'duration_days' => $validated['duration_days'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'],
        ]);

        return redirect()
            ->route('admin.plans.index')
            ->with('success', 'Plan updated successfully.');
    }

    public function destroy(Plan $plan): RedirectResponse
    {
        $plan->delete();

        return redirect()
            ->route('admin.plans.index')
            ->with('success', 'Plan deleted successfully.');
    }
}