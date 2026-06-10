<?php

namespace App\Http\Controllers\Staff\Manager;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ManagerSalesReportController extends Controller
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

        $dateFrom = $request->input('date_from') ?: now()->startOfMonth()->toDateString();
        $dateTo = $request->input('date_to') ?: now()->toDateString();
        $status = $request->input('status');
        $paymentStatus = $request->input('payment_status');

        $from = Carbon::parse($dateFrom)->startOfDay();
        $to = Carbon::parse($dateTo)->endOfDay();

        $salesBase = DB::connection('pos')
            ->table('sales')
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->whereBetween('sold_at', [$from, $to]);

        if ($status) {
            $salesBase->where('status', $status);
        }

        if ($paymentStatus) {
            $salesBase->where('payment_status', $paymentStatus);
        }

        $summary = (clone $salesBase)
            ->selectRaw('
                COUNT(*) as total_transactions,
                COALESCE(SUM(grand_total), 0) as total_sales,
                COALESCE(SUM(subtotal), 0) as subtotal,
                COALESCE(SUM(discount_total), 0) as total_discount,
                COALESCE(SUM(tax_total), 0) as total_tax,
                COALESCE(SUM(amount_paid), 0) as total_paid,
                COALESCE(SUM(change_amount), 0) as total_change
            ')
            ->first();

        $itemsSummary = DB::connection('pos')
            ->table('sale_items')
            ->join('sales', 'sales.id', '=', 'sale_items.sale_id')
            ->where('sale_items.tenant_id', $tenantId)
            ->where('sale_items.branch_id', $branchId)
            ->whereBetween('sales.sold_at', [$from, $to])
            ->when($status, fn ($query) => $query->where('sales.status', $status))
            ->when($paymentStatus, fn ($query) => $query->where('sales.payment_status', $paymentStatus))
            ->selectRaw('
                COALESCE(SUM(sale_items.quantity), 0) as total_items_sold,
                COALESCE(SUM(sale_items.line_total), 0) as total_item_sales,
                COALESCE(SUM(sale_items.quantity * sale_items.unit_cost), 0) as total_cost
            ')
            ->first();

        $grossProfit = (float) ($itemsSummary->total_item_sales ?? 0) - (float) ($itemsSummary->total_cost ?? 0);

        $dailySales = (clone $salesBase)
            ->selectRaw('DATE(sold_at) as date')
            ->selectRaw('COUNT(*) as transactions')
            ->selectRaw('COALESCE(SUM(grand_total), 0) as total')
            ->groupByRaw('DATE(sold_at)')
            ->orderByRaw('DATE(sold_at)')
            ->get();

        $topProducts = DB::connection('pos')
            ->table('sale_items')
            ->join('sales', 'sales.id', '=', 'sale_items.sale_id')
            ->where('sale_items.tenant_id', $tenantId)
            ->where('sale_items.branch_id', $branchId)
            ->whereBetween('sales.sold_at', [$from, $to])
            ->when($status, fn ($query) => $query->where('sales.status', $status))
            ->when($paymentStatus, fn ($query) => $query->where('sales.payment_status', $paymentStatus))
            ->select([
                'sale_items.product_id',
                'sale_items.product_name',
                'sale_items.sku',
            ])
            ->selectRaw('COALESCE(SUM(sale_items.quantity), 0) as quantity_sold')
            ->selectRaw('COALESCE(SUM(sale_items.line_total), 0) as total_sales')
            ->selectRaw('COALESCE(SUM(sale_items.quantity * sale_items.unit_cost), 0) as total_cost')
            ->groupBy('sale_items.product_id', 'sale_items.product_name', 'sale_items.sku')
            ->orderByDesc('total_sales')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                $item->gross_profit = (float) $item->total_sales - (float) $item->total_cost;

                return $item;
            });

        $paymentStatuses = DB::connection('pos')
            ->table('sales')
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->whereNotNull('payment_status')
            ->distinct()
            ->orderBy('payment_status')
            ->pluck('payment_status');

        $statuses = DB::connection('pos')
            ->table('sales')
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->whereNotNull('status')
            ->distinct()
            ->orderBy('status')
            ->pluck('status');

        $recentSales = (clone $salesBase)
            ->select([
                'id',
                'sale_no',
                'cashier_user_id',
                'subtotal',
                'discount_total',
                'tax_total',
                'grand_total',
                'amount_paid',
                'change_amount',
                'payment_status',
                'status',
                'sold_at',
            ])
            ->orderByDesc('sold_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('staff/manager/reports/sales/index', [
            'branch' => $branch,
            'summary' => [
                'total_transactions' => (int) ($summary->total_transactions ?? 0),
                'total_sales' => (float) ($summary->total_sales ?? 0),
                'subtotal' => (float) ($summary->subtotal ?? 0),
                'total_discount' => (float) ($summary->total_discount ?? 0),
                'total_tax' => (float) ($summary->total_tax ?? 0),
                'total_paid' => (float) ($summary->total_paid ?? 0),
                'total_change' => (float) ($summary->total_change ?? 0),
                'total_items_sold' => (float) ($itemsSummary->total_items_sold ?? 0),
                'total_cost' => (float) ($itemsSummary->total_cost ?? 0),
                'gross_profit' => $grossProfit,
            ],
            'dailySales' => $dailySales,
            'topProducts' => $topProducts,
            'recentSales' => $recentSales,
            'statuses' => $statuses,
            'paymentStatuses' => $paymentStatuses,
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'status' => $status,
                'payment_status' => $paymentStatus,
            ],
        ]);
    }
}