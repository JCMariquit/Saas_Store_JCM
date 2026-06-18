<?php

namespace App\Http\Controllers\Staff\Staff;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StaffActivityController extends Controller
{
    private function tenantId(): int
    {
        return (int) auth()->user()->client_id;
    }

    private function branchId(): int
    {
        $branchId = (int) auth()->user()->branch_id;

        abort_if(!$branchId, 403, 'No branch assigned to this staff.');

        return $branchId;
    }

    public function index(Request $request)
    {
        $tenantId = $this->tenantId();
        $branchId = $this->branchId();
        $userId = (int) auth()->id();

        $branch = DB::table('branches')
            ->where('tenant_id', $tenantId)
            ->where('id', $branchId)
            ->where('is_active', 1)
            ->whereNull('deleted_at')
            ->select('id', 'name', 'code', 'is_main', 'is_active')
            ->first();

        abort_if(!$branch, 403, 'Invalid or inactive branch assignment.');

        $products = Product::query()
            ->with('category:id,name')
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->where('created_by', $userId)
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->search;

                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%")
                        ->orWhere('barcode', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->status))
            ->latest('created_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('staff/staff/activity/index', [
            'branch' => $branch,
            'products' => $products,
            'summary' => [
                'total_added' => Product::query()
                    ->where('tenant_id', $tenantId)
                    ->where('branch_id', $branchId)
                    ->where('created_by', $userId)
                    ->count(),

                'today_added' => Product::query()
                    ->where('tenant_id', $tenantId)
                    ->where('branch_id', $branchId)
                    ->where('created_by', $userId)
                    ->whereDate('created_at', now()->toDateString())
                    ->count(),

                'this_month_added' => Product::query()
                    ->where('tenant_id', $tenantId)
                    ->where('branch_id', $branchId)
                    ->where('created_by', $userId)
                    ->whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year)
                    ->count(),

                'active_added' => Product::query()
                    ->where('tenant_id', $tenantId)
                    ->where('branch_id', $branchId)
                    ->where('created_by', $userId)
                    ->where('status', 'active')
                    ->count(),
            ],
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
            ],
            'staff' => [
                'id' => $userId,
                'name' => auth()->user()->name,
            ],
        ]);
    }
}