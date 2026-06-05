<?php

namespace App\Http\Controllers\Staff\Manager;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ManagerTransactionController extends Controller
{
    private function tenantId(): int
    {
        return (int) auth()->user()->client_id;
    }

    private function branchId(): int
    {
        return (int) auth()->user()->branch_id;
    }

    public function index(Request $request)
    {
        $tenantId = $this->tenantId();
        $branchId = $this->branchId();

        $branch = DB::table('branches')
            ->where('id', $branchId)
            ->where('tenant_id', $tenantId)
            ->where('is_active', 1)
            ->whereNull('deleted_at')
            ->select('id', 'tenant_id', 'name', 'code', 'is_main', 'is_active')
            ->first();

        abort_if(!$branch, 403, 'Invalid or inactive branch assignment.');

        $search = trim((string) $request->input('search', ''));
        $status = $request->input('status');
        $paymentStatus = $request->input('payment_status');
        $paymentMethod = $request->input('payment_method');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');

        $baseQuery = DB::table('sales')
            ->leftJoin('payments', function ($join) use ($tenantId, $branchId) {
                $join->on('sales.id', '=', 'payments.sale_id')
                    ->where('payments.tenant_id', $tenantId)
                    ->where('payments.branch_id', $branchId);
            })
            ->where('sales.tenant_id', $tenantId)
            ->where('sales.branch_id', $branchId);

        if ($search !== '') {
            $baseQuery->where(function ($query) use ($search) {
                $query->where('sales.sale_no', 'like', "%{$search}%")
                    ->orWhere('payments.reference_no', 'like', "%{$search}%")
                    ->orWhere('sales.remarks', 'like', "%{$search}%");
            });
        }

        if ($status) {
            $baseQuery->where('sales.status', $status);
        }

        if ($paymentStatus) {
            $baseQuery->where('sales.payment_status', $paymentStatus);
        }

        if ($paymentMethod) {
            $baseQuery->where('payments.method', $paymentMethod);
        }

        if ($dateFrom) {
            $baseQuery->whereDate('sales.sold_at', '>=', $dateFrom);
        }

        if ($dateTo) {
            $baseQuery->whereDate('sales.sold_at', '<=', $dateTo);
        }

        $summaryQuery = clone $baseQuery;

        $transactions = $baseQuery
            ->select(
                'sales.id',
                'sales.sale_no',
                'sales.cashier_user_id',
                'sales.subtotal',
                'sales.discount_total',
                'sales.tax_total',
                'sales.grand_total',
                'sales.amount_paid',
                'sales.change_amount',
                'sales.payment_status',
                'sales.status',
                'sales.remarks',
                'sales.sold_at',
                'sales.created_at',
                'payments.method as payment_method',
                'payments.amount as payment_amount',
                'payments.reference_no as payment_reference_no'
            )
            ->orderByDesc('sales.sold_at')
            ->paginate(10)
            ->withQueryString();

        $saleIds = collect($transactions->items())->pluck('id')->values();

        $itemsBySale = DB::table('sale_items')
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->whereIn('sale_id', $saleIds)
            ->select(
                'id',
                'sale_id',
                'product_id',
                'product_name',
                'sku',
                'quantity',
                'unit_price',
                'discount_amount',
                'line_total'
            )
            ->orderBy('id')
            ->get()
            ->groupBy('sale_id');

        $transactions->getCollection()->transform(function ($transaction) use ($itemsBySale) {
            $transaction->items = $itemsBySale->get($transaction->id, collect())->values();

            return $transaction;
        });

        $summaryRows = $summaryQuery
            ->select(
                DB::raw('COUNT(DISTINCT sales.id) as total_transactions'),
                DB::raw('COALESCE(SUM(sales.grand_total), 0) as total_sales'),
                DB::raw('COALESCE(SUM(sales.discount_total), 0) as total_discount'),
                DB::raw('COALESCE(SUM(sales.tax_total), 0) as total_tax')
            )
            ->first();

        $completedCount = DB::table('sales')
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->where('status', 'completed')
            ->count();

        $voidedCount = DB::table('sales')
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->where('status', 'voided')
            ->count();

        $refundedCount = DB::table('sales')
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->where('status', 'refunded')
            ->count();

        return Inertia::render('staff/manager/transactions/index', [
            'branch' => $branch,
            'scope' => [
                'tenant_id' => $tenantId,
                'branch_id' => $branchId,
            ],
            'transactions' => $transactions,
            'summary' => [
                'total_transactions' => (int) ($summaryRows->total_transactions ?? 0),
                'total_sales' => (float) ($summaryRows->total_sales ?? 0),
                'total_discount' => (float) ($summaryRows->total_discount ?? 0),
                'total_tax' => (float) ($summaryRows->total_tax ?? 0),
                'completed_count' => $completedCount,
                'voided_count' => $voidedCount,
                'refunded_count' => $refundedCount,
            ],
            'filters' => [
                'search' => $search,
                'status' => $status,
                'payment_status' => $paymentStatus,
                'payment_method' => $paymentMethod,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }
}