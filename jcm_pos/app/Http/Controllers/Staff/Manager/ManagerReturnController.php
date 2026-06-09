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

        $tenantId = (int) $branch->tenant_id;
        $branchId = (int) $branch->id;

        return Inertia::render('staff/manager/returns/index', [
            'returns' => $this->getReturns(
                $this->baseQuery($tenantId, $branchId, $filters)
            ),
            'branch' => $branch,
            'summary' => $this->getSummary(
                $this->baseQuery($tenantId, $branchId, $filters)
            ),
            'filters' => $filters,
        ]);
    }

    private function filters(Request $request): array
    {
        return [
            'search' => trim((string) $request->input('search', '')),
            'status' => $request->input('status'),
            'date_from' => $request->input('date_from'),
            'date_to' => $request->input('date_to'),
        ];
    }

    private function baseQuery(int $tenantId, int $branchId, array $filters)
    {
        $query = DB::connection('pos')
            ->table('return_items as returns')
            ->leftJoin('sales', function ($join) use ($tenantId, $branchId) {
                $join->on('sales.id', '=', 'returns.sale_id')
                    ->where('sales.tenant_id', $tenantId)
                    ->where('sales.branch_id', $branchId);
            })
            ->leftJoin('sale_items', function ($join) use ($tenantId, $branchId) {
                $join->on('sale_items.id', '=', 'returns.sale_item_id')
                    ->where('sale_items.tenant_id', $tenantId)
                    ->where('sale_items.branch_id', $branchId);
            })
            ->leftJoin('products', function ($join) use ($tenantId, $branchId) {
                $join->on('products.id', '=', 'returns.product_id')
                    ->where('products.tenant_id', $tenantId)
                    ->where('products.branch_id', $branchId);
            })
            ->where('returns.tenant_id', $tenantId)
            ->where('returns.branch_id', $branchId);

        if ($filters['search'] !== '') {
            $search = $filters['search'];

            $query->where(function ($subQuery) use ($search) {
                $subQuery->where('returns.return_no', 'like', "%{$search}%")
                    ->orWhere('sales.sale_no', 'like', "%{$search}%")
                    ->orWhere('sale_items.product_name', 'like', "%{$search}%")
                    ->orWhere('sale_items.sku', 'like', "%{$search}%")
                    ->orWhere('products.name', 'like', "%{$search}%");
            });
        }

        if ($filters['status']) {
            $query->where('returns.status', $filters['status']);
        }

        if ($filters['date_from']) {
            $query->whereDate('returns.returned_at', '>=', $filters['date_from']);
        }

        if ($filters['date_to']) {
            $query->whereDate('returns.returned_at', '<=', $filters['date_to']);
        }

        return $query;
    }

    private function getSummary($query): array
    {
        $summary = $query
            ->selectRaw('
                COUNT(returns.id) as total_returns,
                COALESCE(SUM(returns.quantity), 0) as total_quantity,
                COALESCE(SUM(returns.line_total), 0) as total_refund,
                COALESCE(SUM(CASE WHEN returns.status = "completed" THEN 1 ELSE 0 END), 0) as completed_returns,
                COALESCE(SUM(CASE WHEN returns.status = "cancelled" THEN 1 ELSE 0 END), 0) as cancelled_returns
            ')
            ->first();

        return [
            'total_returns' => (int) ($summary->total_returns ?? 0),
            'total_quantity' => (float) ($summary->total_quantity ?? 0),
            'total_refund' => (float) ($summary->total_refund ?? 0),
            'completed_returns' => (int) ($summary->completed_returns ?? 0),
            'cancelled_returns' => (int) ($summary->cancelled_returns ?? 0),
        ];
    }

    private function getReturns($query)
    {
        return $query
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
    }
}