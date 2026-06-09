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

        $branch = $this->getBranch($tenantId, $branchId);

        abort_if(!$branch, 403, 'Invalid or inactive branch assignment.');

        $filters = $this->filters($request);

        $transactions = $this->getTransactions($tenantId, $branchId, $filters);
        $this->attachItems($transactions, $tenantId, $branchId);

        return Inertia::render('staff/manager/transactions/index', [
            'branch' => $branch,

            'scope' => [
                'tenant_id' => $tenantId,
                'branch_id' => $branchId,
            ],

            'transactions' => $transactions,
            'summary' => $this->getSummary($tenantId, $branchId, $filters),
            'filters' => $filters,
        ]);
    }

    private function getBranch(int $tenantId, int $branchId)
    {
        return DB::table('branches')
            ->where('id', $branchId)
            ->where('tenant_id', $tenantId)
            ->where('is_active', 1)
            ->whereNull('deleted_at')
            ->select(
                'id',
                'tenant_id',
                'name',
                'code',
                'is_main',
                'is_active'
            )
            ->first();
    }

    private function filters(Request $request): array
    {
        return [
            'search' => trim((string) $request->input('search', '')),
            'status' => $request->input('status'),
            'payment_status' => $request->input('payment_status'),
            'payment_method' => $request->input('payment_method'),
            'date_from' => $request->input('date_from'),
            'date_to' => $request->input('date_to'),
        ];
    }

    private function paymentSubquery(int $tenantId, int $branchId)
    {
        return DB::table('payments')
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->select(
                'sale_id',
                DB::raw('MAX(method) as payment_method'),
                DB::raw('SUM(amount) as payment_amount'),
                DB::raw('MAX(reference_no) as payment_reference_no')
            )
            ->groupBy('sale_id');
    }

    private function baseQuery(int $tenantId, int $branchId, array $filters)
    {
        $paymentSubquery = $this->paymentSubquery($tenantId, $branchId);

        $query = DB::table('sales')
            ->leftJoinSub($paymentSubquery, 'payment_summary', function ($join) {
                $join->on('sales.id', '=', 'payment_summary.sale_id');
            })
            ->where('sales.tenant_id', $tenantId)
            ->where('sales.branch_id', $branchId);

        if ($filters['search'] !== '') {
            $search = $filters['search'];

            $query->where(function ($query) use ($search) {
                $query->where('sales.sale_no', 'like', "%{$search}%")
                    ->orWhere('sales.remarks', 'like', "%{$search}%")
                    ->orWhere('payment_summary.payment_reference_no', 'like', "%{$search}%");
            });
        }

        if ($filters['status']) {
            $query->where('sales.status', $filters['status']);
        }

        if ($filters['payment_status']) {
            $query->where('sales.payment_status', $filters['payment_status']);
        }

        if ($filters['payment_method']) {
            $query->where('payment_summary.payment_method', $filters['payment_method']);
        }

        if ($filters['date_from']) {
            $query->whereDate('sales.sold_at', '>=', $filters['date_from']);
        }

        if ($filters['date_to']) {
            $query->whereDate('sales.sold_at', '<=', $filters['date_to']);
        }

        return $query;
    }

    private function getTransactions(int $tenantId, int $branchId, array $filters)
    {
        return $this->baseQuery($tenantId, $branchId, $filters)
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
                'payment_summary.payment_method',
                'payment_summary.payment_amount',
                'payment_summary.payment_reference_no'
            )
            ->orderByDesc('sales.sold_at')
            ->orderByDesc('sales.id')
            ->paginate(10)
            ->withQueryString();
    }

    private function attachItems($transactions, int $tenantId, int $branchId): void
    {
        $saleIds = collect($transactions->items())
            ->pluck('id')
            ->filter()
            ->values();

        if ($saleIds->isEmpty()) {
            return;
        }

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
            $transaction->items = $itemsBySale
                ->get($transaction->id, collect())
                ->values();

            return $transaction;
        });
    }

    private function getSummary(int $tenantId, int $branchId, array $filters): array
    {
        $summary = $this->baseQuery($tenantId, $branchId, $filters)
            ->select(
                DB::raw('COUNT(sales.id) as total_transactions'),
                DB::raw('COALESCE(SUM(sales.grand_total), 0) as total_sales'),
                DB::raw('COALESCE(SUM(sales.discount_total), 0) as total_discount'),
                DB::raw('COALESCE(SUM(sales.tax_total), 0) as total_tax')
            )
            ->first();

        $statusCounts = $this->baseQuery($tenantId, $branchId, $filters)
            ->select(
                'sales.status',
                DB::raw('COUNT(sales.id) as total')
            )
            ->groupBy('sales.status')
            ->pluck('total', 'sales.status');

        return [
            'total_transactions' => (int) ($summary->total_transactions ?? 0),
            'total_sales' => (float) ($summary->total_sales ?? 0),
            'total_discount' => (float) ($summary->total_discount ?? 0),
            'total_tax' => (float) ($summary->total_tax ?? 0),
            'completed_count' => (int) ($statusCounts['completed'] ?? 0),
            'voided_count' => (int) ($statusCounts['voided'] ?? 0),
            'refunded_count' => (int) ($statusCounts['refunded'] ?? 0),
        ];
    }
}