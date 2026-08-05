<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PlanController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        $plans = Plan::with(['product', 'prices'])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($subQuery) use ($search) {
                    $subQuery->where('plan_name', 'like', "%{$search}%")
                        ->orWhere('plan_code', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('status', 'like', "%{$search}%")
                        ->orWhereHas('product', fn ($productQuery) => $productQuery
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('product_code', 'like', "%{$search}%"));
                });
            })
            ->orderBy('product_id')
            ->orderBy('sort_order')
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Plan $plan) => [
                'id' => $plan->id,
                'product_id' => $plan->product_id,
                'product_name' => $plan->product?->name,
                'plan_name' => $plan->plan_name,
                'plan_code' => $plan->plan_code,
                'price' => $plan->price,
                'duration_days' => $plan->duration_days,
                'billing_interval' => $plan->billing_interval,
                'quarterly_price' => $plan->prices->firstWhere('billing_interval', 'quarterly')?->price,
                'yearly_price' => $plan->prices->firstWhere('billing_interval', 'yearly')?->price,
                'trial_days' => $plan->trial_days,
                'has_role_based_access' => (bool) $plan->has_role_based_access,
                'has_multi_branch' => (bool) $plan->has_multi_branch,
                'has_activity_logs' => (bool) $plan->has_activity_logs,
                'activity_log_retention_days' => $plan->activity_log_retention_days,
                'max_branches' => $plan->max_branches,
                'max_warehouses' => $plan->max_warehouses,
                'max_staff' => $plan->max_staff,
                'sort_order' => $plan->sort_order,
                'description' => $plan->description,
                'status' => $plan->status,
                'created_at' => $plan->created_at?->format('M d, Y h:i A'),
            ]);

        return Inertia::render('admin/plans/index', [
            'filters' => ['search' => $search],
            'plans' => $plans,
            'products' => Product::query()
                ->where('status', '!=', 'inactive')
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(['id', 'name']),
            'stats' => [
                'total_plans' => Plan::count(),
                'active_plans' => Plan::where('status', 'active')->count(),
                'inactive_plans' => Plan::whereIn('status', ['inactive', 'archived'])->count(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validatePlan($request);

        $billingInterval = $this->inferBillingInterval((int) $validated['duration_days']);

        $plan = Plan::create([
            'product_id' => $validated['product_id'],
            'plan_code' => $this->generatePlanCode((int) $validated['product_id'], $validated['plan_name']),
            'plan_name' => $validated['plan_name'],
            'price' => $validated['price'],
            'billing_interval' => $billingInterval,
            'currency' => 'PHP',
            'duration_days' => $validated['duration_days'],
            'trial_days' => $validated['trial_days'] ?? 0,
            'description' => $validated['description'] ?? null,
            'has_role_based_access' => $validated['has_role_based_access'] ?? false,
            'has_multi_branch' => $validated['has_multi_branch'] ?? false,
            'has_activity_logs' => $validated['has_activity_logs'] ?? false,
            'activity_log_retention_days' => $validated['has_activity_logs'] ? ($validated['activity_log_retention_days'] ?? null) : null,
            'max_branches' => $validated['max_branches'] ?? null,
            'max_warehouses' => $validated['max_warehouses'] ?? null,
            'max_staff' => $validated['max_staff'] ?? null,
            'sort_order' => $validated['sort_order'] ?? 0,
            'status' => $validated['status'],
        ]);

        $this->syncDefaultPrice($plan, $validated);

        return to_route('admin.plans.index')->with('success', 'Plan created successfully.');
    }

    public function update(Request $request, Plan $plan): RedirectResponse
    {
        $validated = $this->validatePlan($request);

        $plan->update([
            'product_id' => $validated['product_id'],
            'plan_code' => $this->generatePlanCode((int) $validated['product_id'], $validated['plan_name'], $plan->id),
            'plan_name' => $validated['plan_name'],
            'price' => $validated['price'],
            'billing_interval' => $this->inferBillingInterval((int) $validated['duration_days']),
            'duration_days' => $validated['duration_days'],
            'trial_days' => $validated['trial_days'] ?? 0,
            'description' => $validated['description'] ?? null,
            'has_role_based_access' => $validated['has_role_based_access'] ?? false,
            'has_multi_branch' => $validated['has_multi_branch'] ?? false,
            'has_activity_logs' => $validated['has_activity_logs'] ?? false,
            'activity_log_retention_days' => $validated['has_activity_logs'] ? ($validated['activity_log_retention_days'] ?? null) : null,
            'max_branches' => $validated['max_branches'] ?? null,
            'max_warehouses' => $validated['max_warehouses'] ?? null,
            'max_staff' => $validated['max_staff'] ?? null,
            'sort_order' => $validated['sort_order'] ?? $plan->sort_order,
            'status' => $validated['status'],
        ]);

        $this->syncDefaultPrice($plan, $validated);

        return to_route('admin.plans.index')->with('success', 'Plan updated successfully.');
    }

    public function destroy(Plan $plan): RedirectResponse
    {
        if ($plan->subscriptions()->exists()) {
            $plan->update(['status' => 'archived']);

            return back()->with('success', 'Plan has subscriptions and was archived instead of deleted.');
        }

        $plan->delete();

        return to_route('admin.plans.index')->with('success', 'Plan deleted successfully.');
    }

    private function validatePlan(Request $request): array
    {
        return $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'plan_name' => ['required', 'string', 'max:100'],
            'price' => ['required', 'numeric', 'min:0'],
            'quarterly_price' => ['nullable', 'numeric', 'min:0'],
            'yearly_price' => ['nullable', 'numeric', 'min:0'],
            'duration_days' => ['required', 'integer', 'min:1', 'max:3650'],
            'trial_days' => ['nullable', 'integer', 'min:0', 'max:365'],
            'has_role_based_access' => ['nullable', 'boolean'],
            'has_multi_branch' => ['nullable', 'boolean'],
            'has_activity_logs' => ['nullable', 'boolean'],
            'activity_log_retention_days' => ['nullable', 'integer', 'min:1', 'max:3650'],
            'max_branches' => ['nullable', 'integer', 'min:0', 'max:10000'],
            'max_warehouses' => ['nullable', 'integer', 'min:0', 'max:10000'],
            'max_staff' => ['nullable', 'integer', 'min:0', 'max:100000'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'description' => ['nullable', 'string'],
            'status' => ['required', 'in:active,inactive,archived'],
        ]);
    }

    private function syncDefaultPrice(Plan $plan, array $priceInput = []): void
    {
        DB::transaction(function () use ($plan, $priceInput) {
            DB::table('plan_prices')
                ->where('plan_id', $plan->id)
                ->update([
                    'is_default' => false,
                    'updated_at' => now(),
                ]);

            $this->upsertPriceRow(
                $plan,
                $plan->billing_interval,
                (float) $plan->price,
                (int) $plan->duration_days,
                10,
                true,
            );

            $optionalRows = [
                'quarterly' => [
                    'price' => $priceInput['quarterly_price'] ?? null,
                    'duration_days' => 90,
                    'sort_order' => 20,
                ],
                'yearly' => [
                    'price' => $priceInput['yearly_price'] ?? null,
                    'duration_days' => 365,
                    'sort_order' => 30,
                ],
            ];

            foreach ($optionalRows as $interval => $row) {
                if ($interval === $plan->billing_interval) {
                    continue;
                }

                if ($row['price'] !== null && $row['price'] !== '') {
                    $this->upsertPriceRow(
                        $plan,
                        $interval,
                        (float) $row['price'],
                        (int) $row['duration_days'],
                        (int) $row['sort_order'],
                        false,
                    );
                } else {
                    DB::table('plan_prices')
                        ->where('plan_id', $plan->id)
                        ->where('billing_interval', $interval)
                        ->where('currency', $plan->currency)
                        ->update([
                            'is_default' => false,
                            'status' => $plan->status === 'archived' ? 'archived' : 'inactive',
                            'updated_at' => now(),
                        ]);
                }
            }
        });
    }

    private function upsertPriceRow(
        Plan $plan,
        string $interval,
        float $price,
        int $durationDays,
        int $sortOrder,
        bool $isDefault,
    ): void {
        $lookup = [
            'plan_id' => $plan->id,
            'billing_interval' => $interval,
            'currency' => $plan->currency,
        ];

        $values = [
            'price' => $price,
            'duration_days' => $durationDays,
            'trial_days_override' => $plan->trial_days ?: null,
            'is_default' => $isDefault,
            'sort_order' => $sortOrder,
            'status' => $plan->status,
            'updated_at' => now(),
        ];

        $existing = DB::table('plan_prices')->where($lookup)->first();

        if ($existing) {
            DB::table('plan_prices')->where('id', $existing->id)->update($values);
        } else {
            DB::table('plan_prices')->insert($lookup + $values + ['created_at' => now()]);
        }
    }

    private function generatePlanCode(int $productId, string $name, ?int $ignoreId = null): string
    {
        $base = strtoupper(Str::slug($name, '_')) ?: 'PLAN';
        $code = $base;
        $counter = 2;

        while (Plan::query()
            ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
            ->where('product_id', $productId)
            ->where('plan_code', $code)
            ->exists()) {
            $code = $base.'_'.$counter;
            $counter++;
        }

        return $code;
    }

    private function inferBillingInterval(int $durationDays): string
    {
        return match (true) {
            $durationDays >= 360 && $durationDays <= 370 => 'yearly',
            $durationDays >= 85 && $durationDays <= 95 => 'quarterly',
            $durationDays >= 28 && $durationDays <= 31 => 'monthly',
            default => 'custom',
        };
    }
}
