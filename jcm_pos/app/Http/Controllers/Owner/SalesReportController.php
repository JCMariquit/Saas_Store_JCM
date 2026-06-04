<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\SaleItem;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SalesReportController extends Controller
{
    public function index(Request $request)
    {
        $tenantId = auth()->id();

        $dateFrom = $request->input('date_from', now()->startOfMonth()->toDateString());
        $dateTo = $request->input('date_to', now()->toDateString());

        $from = Carbon::parse($dateFrom)->startOfDay();
        $to = Carbon::parse($dateTo)->endOfDay();

        $salesQuery = Sale::query()
            ->where('tenant_id', $tenantId)
            ->whereBetween('sold_at', [$from, $to])
            ->where('status', 'completed');

        $grossSales = (clone $salesQuery)->sum('grand_total');
        $totalDiscount = (clone $salesQuery)->sum('discount_total');
        $totalTransactions = (clone $salesQuery)->count();

        $totalItemsSold = SaleItem::query()
            ->where('tenant_id', $tenantId)
            ->whereHas('sale', function ($query) use ($from, $to) {
                $query->whereBetween('sold_at', [$from, $to])
                    ->where('status', 'completed');
            })
            ->sum('quantity');

        $averageSale = $totalTransactions > 0
            ? $grossSales / $totalTransactions
            : 0;

        $dailySales = (clone $salesQuery)
            ->selectRaw('DATE(sold_at) as sale_date')
            ->selectRaw('SUM(grand_total) as total_sales')
            ->selectRaw('COUNT(*) as transaction_count')
            ->groupBy(DB::raw('DATE(sold_at)'))
            ->orderBy('sale_date')
            ->get()
            ->map(function ($row) {
                return [
                    'date' => Carbon::parse($row->sale_date)->format('M d'),
                    'raw_date' => $row->sale_date,
                    'total_sales' => (float) $row->total_sales,
                    'transaction_count' => (int) $row->transaction_count,
                ];
            });

        $topProducts = SaleItem::query()
            ->where('tenant_id', $tenantId)
            ->whereHas('sale', function ($query) use ($from, $to) {
                $query->whereBetween('sold_at', [$from, $to])
                    ->where('status', 'completed');
            })
            ->select('product_id', 'product_name', 'sku')
            ->selectRaw('SUM(quantity) as total_quantity')
            ->selectRaw('SUM(line_total) as total_sales')
            ->groupBy('product_id', 'product_name', 'sku')
            ->orderByDesc('total_sales')
            ->limit(10)
            ->get()
            ->map(function ($row) {
                return [
                    'product_id' => $row->product_id,
                    'product_name' => $row->product_name,
                    'sku' => $row->sku,
                    'total_quantity' => (float) $row->total_quantity,
                    'total_sales' => (float) $row->total_sales,
                ];
            });

        $recentSales = (clone $salesQuery)
            ->with(['branch', 'items'])
            ->latest('sold_at')
            ->limit(10)
            ->get()
            ->map(function ($sale) {
                return [
                    'id' => $sale->id,
                    'sale_no' => $sale->sale_no,
                    'branch_name' => $sale->branch?->name ?? 'Main Branch',
                    'items_count' => $sale->items->count(),
                    'grand_total' => (float) $sale->grand_total,
                    'payment_status' => $sale->payment_status,
                    'status' => $sale->status,
                    'sold_at' => optional($sale->sold_at)->format('M d, Y h:i A'),
                ];
            });

        return Inertia::render('owner/reports/sales/index', [
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],

            'summary' => [
                'gross_sales' => (float) $grossSales,
                'total_discount' => (float) $totalDiscount,
                'total_transactions' => (int) $totalTransactions,
                'total_items_sold' => (float) $totalItemsSold,
                'average_sale' => (float) $averageSale,
            ],

            'daily_sales' => $dailySales,
            'top_products' => $topProducts,
            'recent_sales' => $recentSales,
        ]);
    }
}