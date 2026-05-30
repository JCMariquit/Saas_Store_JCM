<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\SaleItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SoldItemsController extends Controller
{
    public function index(Request $request)
    {
        $tenantId = auth()->user()->tenantId();

        $search = $request->input('search');
        $branchId = $request->input('branch_id');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');

        $branches = Branch::query()
            ->where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderByDesc('is_main')
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'is_main']);

        $baseQuery = SaleItem::query()
            ->from('sale_items as si')
            ->join('sales as s', 's.id', '=', 'si.sale_id')
            ->leftJoin('branches as b', 'b.id', '=', 'si.branch_id')
            ->leftJoin('payments as p', 'p.sale_id', '=', 's.id')
            ->where('si.tenant_id', $tenantId)
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('si.product_name', 'like', "%{$search}%")
                        ->orWhere('si.sku', 'like', "%{$search}%")
                        ->orWhere('s.sale_no', 'like', "%{$search}%");
                });
            })
            ->when($branchId, fn ($query) => $query->where('si.branch_id', $branchId))
            ->when($dateFrom, fn ($query) => $query->whereDate('s.sold_at', '>=', $dateFrom))
            ->when($dateTo, fn ($query) => $query->whereDate('s.sold_at', '<=', $dateTo));

        $items = (clone $baseQuery)
            ->select([
                'si.id',
                'si.sale_id',
                'si.product_id',
                'si.product_name',
                'si.sku',
                'si.quantity',
                'si.unit_price',
                'si.unit_cost',
                'si.discount_amount',
                'si.line_total',
                'si.created_at',
                's.sale_no',
                's.status as sale_status',
                's.sold_at',
                'b.name as branch_name',
                'b.code as branch_code',
                DB::raw('MAX(p.method) as payment_method'),
            ])
            ->groupBy([
                'si.id',
                'si.sale_id',
                'si.product_id',
                'si.product_name',
                'si.sku',
                'si.quantity',
                'si.unit_price',
                'si.unit_cost',
                'si.discount_amount',
                'si.line_total',
                'si.created_at',
                's.sale_no',
                's.status',
                's.sold_at',
                'b.name',
                'b.code',
            ])
            ->latest('s.sold_at')
            ->paginate(15)
            ->withQueryString();

        $summary = (clone $baseQuery)
            ->where('s.status', 'completed')
            ->selectRaw('
                COUNT(si.id) as total_lines,
                COALESCE(SUM(si.quantity), 0) as total_qty,
                COALESCE(SUM(si.line_total), 0) as total_revenue,
                COALESCE(SUM((si.unit_price - si.unit_cost) * si.quantity), 0) as estimated_profit
            ')
            ->first();

        return Inertia::render('owner/sales/sold-items/index', [
            'items' => $items,
            'branches' => $branches,
            'summary' => $summary,
            'filters' => [
                'search' => $search,
                'branch_id' => $branchId,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }
}