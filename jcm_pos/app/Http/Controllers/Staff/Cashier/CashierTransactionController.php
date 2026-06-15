<?php

namespace App\Http\Controllers\Staff\Cashier;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CashierTransactionController extends Controller
{
    private function tenantId(): int
    {
        return (int) auth()->user()->client_id;
    }

    private function branchId(): int
    {
        $branchId = (int) auth()->user()->branch_id;

        abort_if(!$branchId, 403, 'No branch assigned to this cashier.');

        return $branchId;
    }

    public function index(Request $request)
    {
        $tenantId = $this->tenantId();
        $branchId = $this->branchId();
        $cashierId = (int) auth()->id();

        $search = $request->input('search');
        $status = $request->input('status');
        $paymentMethod = $request->input('payment_method');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');

        $sales = Sale::query()
            ->with([
                'items:id,sale_id,product_id,product_name,sku,quantity,unit_price,discount_amount,line_total',
                'payments:id,sale_id,method,amount,reference_no,remarks,created_at',
            ])
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->where('cashier_user_id', $cashierId)
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('sale_no', 'like', "%{$search}%")
                        ->orWhere('remarks', 'like', "%{$search}%")
                        ->orWhereHas('items', function ($itemQuery) use ($search) {
                            $itemQuery->where('product_name', 'like', "%{$search}%")
                                ->orWhere('sku', 'like', "%{$search}%");
                        })
                        ->orWhereHas('payments', function ($paymentQuery) use ($search) {
                            $paymentQuery->where('reference_no', 'like', "%{$search}%");
                        });
                });
            })
            ->when($status, fn ($query) => $query->where('status', $status))
            ->when($paymentMethod, function ($query) use ($paymentMethod) {
                $query->whereHas('payments', fn ($q) => $q->where('method', $paymentMethod));
            })
            ->when($dateFrom, fn ($query) => $query->whereDate('sold_at', '>=', $dateFrom))
            ->when($dateTo, fn ($query) => $query->whereDate('sold_at', '<=', $dateTo))
            ->latest('sold_at')
            ->paginate(12)
            ->withQueryString();

        $summaryQuery = Sale::query()
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->where('cashier_user_id', $cashierId)
            ->when($dateFrom, fn ($query) => $query->whereDate('sold_at', '>=', $dateFrom))
            ->when($dateTo, fn ($query) => $query->whereDate('sold_at', '<=', $dateTo));

        $todayQuery = Sale::query()
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->where('cashier_user_id', $cashierId)
            ->whereDate('sold_at', today());

        return Inertia::render('staff/cashier/transactions/index', [
            'sales' => $sales,
            'summary' => [
                'total_transactions' => (clone $summaryQuery)->count(),
                'total_sales' => (float) (clone $summaryQuery)->sum('grand_total'),
                'today_transactions' => (clone $todayQuery)->count(),
                'today_sales' => (float) (clone $todayQuery)->sum('grand_total'),
            ],
            'filters' => [
                'search' => $search,
                'status' => $status,
                'payment_method' => $paymentMethod,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }
}