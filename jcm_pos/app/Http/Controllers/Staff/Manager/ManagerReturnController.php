<?php

namespace App\Http\Controllers\Staff\Manager;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ManagerReturnController extends Controller
{
    private function managerBranch(): Branch
    {
        $branchId = auth()->user()->branch_id;

        abort_if(!$branchId, 403, 'No branch assigned to this manager.');

        return Branch::query()
            ->where('id', $branchId)
            ->where('is_active', true)
            ->firstOrFail(['id', 'tenant_id', 'name', 'code', 'is_main', 'is_active']);
    }

    public function index(Request $request)
    {
        $branch = $this->managerBranch();
        $tenantId = (int) $branch->tenant_id;
        $branchId = (int) $branch->id;

        $baseQuery = DB::connection('pos')
            ->table('return_items as returns')
            ->leftJoin('sales', 'sales.id', '=', 'returns.sale_id')
            ->leftJoin('sale_items', 'sale_items.id', '=', 'returns.sale_item_id')
            ->leftJoin('products', 'products.id', '=', 'returns.product_id')
            ->where('returns.tenant_id', $tenantId)
            ->where('returns.branch_id', $branchId)
            ->when($request->search, function ($query, $search) {
                $query->where(function ($subQuery) use ($search) {
                    $subQuery->where('returns.return_no', 'like', "%{$search}%")
                        ->orWhere('sales.sale_no', 'like', "%{$search}%")
                        ->orWhere('sale_items.product_name', 'like', "%{$search}%")
                        ->orWhere('products.name', 'like', "%{$search}%")
                        ->orWhere('sale_items.sku', 'like', "%{$search}%");
                });
            })
            ->when($request->status, fn ($query, $status) => $query->where('returns.status', $status))
            ->when($request->date_from, fn ($query, $date) => $query->whereDate('returns.returned_at', '>=', $date))
            ->when($request->date_to, fn ($query, $date) => $query->whereDate('returns.returned_at', '<=', $date));

        $summary = (clone $baseQuery)
            ->selectRaw('
                COUNT(returns.id) as total_returns,
                COALESCE(SUM(returns.quantity), 0) as total_quantity,
                COALESCE(SUM(returns.line_total), 0) as total_refund,
                SUM(CASE WHEN returns.status = "completed" THEN 1 ELSE 0 END) as completed_returns,
                SUM(CASE WHEN returns.status = "cancelled" THEN 1 ELSE 0 END) as cancelled_returns
            ')
            ->first();

        $returns = $baseQuery
            ->select([
                'returns.id',
                'returns.sale_id',
                'returns.sale_item_id',
                'returns.product_id',
                'returns.return_no',
                'returns.quantity',
                'returns.unit_price',
                'returns.line_total',
                'returns.reason',
                'returns.status',
                'returns.returned_by',
                'returns.returned_at',
                'sales.sale_no',
                'sales.payment_status',
                'sale_items.product_name',
                'sale_items.sku',
                'products.name as current_product_name',
            ])
            ->orderByDesc('returns.returned_at')
            ->orderByDesc('returns.id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('staff/manager/returns/index', [
            'returns' => $returns,
            'branch' => $branch,
            'summary' => [
                'total_returns' => (int) ($summary->total_returns ?? 0),
                'total_quantity' => (float) ($summary->total_quantity ?? 0),
                'total_refund' => (float) ($summary->total_refund ?? 0),
                'completed_returns' => (int) ($summary->completed_returns ?? 0),
                'cancelled_returns' => (int) ($summary->cancelled_returns ?? 0),
            ],
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
                'date_from' => $request->date_from,
                'date_to' => $request->date_to,
            ],
        ]);
    }
}