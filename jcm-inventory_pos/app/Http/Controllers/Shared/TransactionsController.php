<?php

namespace App\Http\Controllers\Shared;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TransactionsController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $status = $request->input('status');
        $paymentMethod = $request->input('payment_method');

        $baseQuery = DB::table('sales as s')
            ->leftJoin('payments as p', 'p.sale_id', '=', 's.id')
            ->select(
                's.id',
                's.sale_no',
                's.subtotal',
                's.discount_total',
                's.tax_total',
                's.grand_total',
                's.amount_paid',
                's.change_amount',
                's.payment_status',
                's.status',
                's.remarks',
                's.sold_at',
                DB::raw("'Unknown' as cashier_name"),
                'p.method as payment_method',
                'p.reference_no',
                'p.remarks as payment_remarks',
            )
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('s.sale_no', 'like', "%{$search}%")
                        ->orWhere('p.reference_no', 'like', "%{$search}%");
                });
            })
            ->when($status, fn ($query) => $query->where('s.status', $status))
            ->when($paymentMethod, fn ($query) => $query->where('p.method', $paymentMethod));

        $summaryQuery = clone $baseQuery;

        $transactions = $baseQuery
            ->orderByDesc('s.sold_at')
            ->orderByDesc('s.id')
            ->paginate(10)
            ->withQueryString();

        $saleIds = collect($transactions->items())->pluck('id');

        $items = DB::table('sale_items')
            ->whereIn('sale_id', $saleIds)
            ->orderBy('id')
            ->get()
            ->groupBy('sale_id');

        $transactions->getCollection()->transform(function ($sale) use ($items) {
            $sale->items = $items->get($sale->id, collect())->values();

            return $sale;
        });

        $summary = [
            'total_sales' => (clone $summaryQuery)->sum('s.grand_total'),
            'transactions' => (clone $summaryQuery)->count('s.id'),
            'average_sale' => (clone $summaryQuery)->avg('s.grand_total') ?? 0,
            'total_items' => DB::table('sale_items')
                ->whereIn('sale_id', $saleIds)
                ->sum('quantity'),
        ];

        return Inertia::render('owner/sales/transactions/index', [
            'transactions' => $transactions,
            'summary' => $summary,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'payment_method' => $paymentMethod,
            ],
        ]);
    }
}