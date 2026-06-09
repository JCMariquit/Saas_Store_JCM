<?php

namespace App\Http\Controllers\Staff\Manager;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Support\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ManagerSoldItemsController extends Controller
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

        ActivityLogger::log(
            module: 'sold_items',
            action: 'viewed',
            description: 'Viewed sold items list.',
            properties: [
                'search' => $filters['search'] ?: null,
                'status' => $filters['status'] ?: null,
                'date_from' => $filters['date_from'] ?: null,
                'date_to' => $filters['date_to'] ?: null,
            ],
            tenantId: $tenantId,
            branchId: $branchId
        );

        return Inertia::render('staff/manager/sold-items/index', [
            'soldItems' => $this->getSoldItems(
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
            ->table('sale_items')
            ->join('sales', 'sales.id', '=', 'sale_items.sale_id')
            ->where('sale_items.tenant_id', $tenantId)
            ->where('sale_items.branch_id', $branchId)
            ->where('sales.tenant_id', $tenantId)
            ->where('sales.branch_id', $branchId);

        if ($filters['search'] !== '') {
            $search = $filters['search'];

            $query->where(function ($subQuery) use ($search) {
                $subQuery->where('sale_items.product_name', 'like', "%{$search}%")
                    ->orWhere('sale_items.sku', 'like', "%{$search}%")
                    ->orWhere('sales.sale_no', 'like', "%{$search}%");
            });
        }

        if ($filters['status']) {
            $query->where('sales.status', $filters['status']);
        }

        if ($filters['date_from']) {
            $query->whereDate('sales.sold_at', '>=', $filters['date_from']);
        }

        if ($filters['date_to']) {
            $query->whereDate('sales.sold_at', '<=', $filters['date_to']);
        }

        return $query;
    }

    private function getSummary($query): array
    {
        $summary = $query
            ->selectRaw('
                COUNT(sale_items.id) as total_items,
                COALESCE(SUM(sale_items.quantity), 0) as total_quantity,
                COALESCE(SUM(sale_items.line_total), 0) as total_sales,
                COALESCE(SUM(sale_items.quantity * sale_items.unit_cost), 0) as total_cost,
                COALESCE(SUM(sale_items.line_total - (sale_items.quantity * sale_items.unit_cost)), 0) as gross_profit
            ')
            ->first();

        return [
            'total_items' => (int) ($summary->total_items ?? 0),
            'total_quantity' => (float) ($summary->total_quantity ?? 0),
            'total_sales' => (float) ($summary->total_sales ?? 0),
            'total_cost' => (float) ($summary->total_cost ?? 0),
            'gross_profit' => (float) ($summary->gross_profit ?? 0),
        ];
    }

    private function getSoldItems($query)
    {
        return $query
            ->select([
                'sale_items.id',
                'sale_items.sale_id',
                'sale_items.product_id',
                'sale_items.product_name',
                'sale_items.sku',
                'sale_items.quantity',
                'sale_items.unit_price',
                'sale_items.unit_cost',
                'sale_items.discount_amount',
                'sale_items.line_total',
                'sales.sale_no',
                'sales.status',
                'sales.payment_status',
                'sales.sold_at',
            ])
            ->orderByDesc('sales.sold_at')
            ->orderByDesc('sale_items.id')
            ->paginate(10)
            ->withQueryString();
    }
}