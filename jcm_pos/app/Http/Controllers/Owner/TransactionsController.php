<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TransactionsController extends Controller
{
    private function tenantId(): int
    {
        $user = auth()->user();

        return (int) ($user->client_id ?: $user->id);
    }

    private function getSelectedBranchId(Request $request, int $tenantId): ?int
    {
        if ($request->filled('branch_id')) {
            $branchId = (int) $request->branch_id;

            return Branch::query()
                ->where('tenant_id', $tenantId)
                ->where('id', $branchId)
                ->exists()
                    ? $branchId
                    : null;
        }

        return Branch::query()
            ->where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderByDesc('is_main')
            ->orderBy('name')
            ->value('id');
    }

    public function index(Request $request)
    {
        $tenantId = $this->tenantId();
        $selectedBranchId = $this->getSelectedBranchId($request, $tenantId);

        $search = $request->input('search');
        $status = $request->input('status');
        $paymentMethod = $request->input('payment_method');

        $branches = Branch::query()
            ->where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderByDesc('is_main')
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'is_main', 'is_active']);

        $baseQuery = DB::connection('pos')
            ->table('sales as s')
            ->leftJoin('payments as p', 'p.sale_id', '=', 's.id')
            ->select(
                's.id',
                's.branch_id',
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
            ->where('s.tenant_id', $tenantId)
            ->when($selectedBranchId, function ($query) use ($selectedBranchId) {
                $query->where('s.branch_id', $selectedBranchId);
            })
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

        $items = DB::connection('pos')
            ->table('sale_items')
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
            'total_items' => DB::connection('pos')
                ->table('sale_items')
                ->whereIn('sale_id', $saleIds)
                ->sum('quantity'),
        ];

        return Inertia::render('owner/sales/transactions/index', [
            'transactions' => $transactions,
            'branches' => $branches,
            'selectedBranchId' => $selectedBranchId,
            'summary' => $summary,
            'filters' => [
                'branch_id' => $selectedBranchId,
                'search' => $search,
                'status' => $status,
                'payment_method' => $paymentMethod,
            ],
        ]);
    }
}