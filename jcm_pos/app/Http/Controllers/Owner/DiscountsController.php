<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Discount;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DiscountsController extends Controller
{
    private string $discountsUrl = '/client/sales/discounts';

    public function index(Request $request)
    {
        $tenantId = auth()->user()->tenantId();

        $branches = Branch::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderByDesc('is_main')
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'is_main', 'is_active']);

        $discounts = Discount::query()
            ->where('tenant_id', $tenantId)
            ->when($request->filled('branch_id'), fn ($q) => $q->where('branch_id', $request->branch_id))
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->search;

                $q->where(function ($sub) use ($search) {
                    $sub->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('status'), function ($q) use ($request) {
                if ($request->status === 'active') {
                    $q->where('is_active', true);
                }

                if ($request->status === 'inactive') {
                    $q->where('is_active', false);
                }
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('owner/sales/discounts/index', [
            'branches' => $branches,
            'discounts' => $discounts,
            'filters' => [
                'branch_id' => $request->branch_id,
                'search' => $request->search,
                'status' => $request->status,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $tenantId = auth()->user()->tenantId();

        $validated = $request->validate([
            'branch_id' => ['nullable', 'integer'],
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:100'],
            'type' => ['required', 'in:percent,fixed'],
            'value' => ['required', 'numeric', 'min:0'],
            'min_purchase' => ['nullable', 'numeric', 'min:0'],
            'max_discount' => ['nullable', 'numeric', 'min:0'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'is_active' => ['required', 'boolean'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        Discount::create([
            'tenant_id' => $tenantId,
            'branch_id' => $validated['branch_id'] ?? null,
            'name' => $validated['name'],
            'code' => $validated['code'] ?? null,
            'type' => $validated['type'],
            'value' => $validated['value'],
            'min_purchase' => $validated['min_purchase'] ?? 0,
            'max_discount' => $validated['max_discount'] ?? null,
            'starts_at' => $validated['starts_at'] ?? null,
            'ends_at' => $validated['ends_at'] ?? null,
            'is_active' => $validated['is_active'],
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->to($this->discountsUrl)->with('success', 'Discount created successfully.');
    }

    public function update(Request $request, Discount $discount)
    {
        $tenantId = auth()->user()->tenantId();

        abort_if((int) $discount->tenant_id !== (int) $tenantId, 403);

        $validated = $request->validate([
            'branch_id' => ['nullable', 'integer'],
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:100'],
            'type' => ['required', 'in:percent,fixed'],
            'value' => ['required', 'numeric', 'min:0'],
            'min_purchase' => ['nullable', 'numeric', 'min:0'],
            'max_discount' => ['nullable', 'numeric', 'min:0'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'is_active' => ['required', 'boolean'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $discount->update([
            'branch_id' => $validated['branch_id'] ?? null,
            'name' => $validated['name'],
            'code' => $validated['code'] ?? null,
            'type' => $validated['type'],
            'value' => $validated['value'],
            'min_purchase' => $validated['min_purchase'] ?? 0,
            'max_discount' => $validated['max_discount'] ?? null,
            'starts_at' => $validated['starts_at'] ?? null,
            'ends_at' => $validated['ends_at'] ?? null,
            'is_active' => $validated['is_active'],
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->to($this->discountsUrl)->with('success', 'Discount updated successfully.');
    }

    public function destroy(Discount $discount)
    {
        $tenantId = auth()->user()->tenantId();

        abort_if((int) $discount->tenant_id !== (int) $tenantId, 403);

        $discount->delete();

        return redirect()->to($this->discountsUrl)->with('success', 'Discount deleted successfully.');
    }
}