<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\CashDrawer;
use App\Models\CashDrawerTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CashDrawerController extends Controller
{
    private string $cashDrawerUrl = '/client/sales/cash-drawer';

    public function index(Request $request)
    {
        $tenantId = auth()->user()->tenantId();

        $branches = Branch::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderByDesc('is_main')
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'is_main', 'is_active']);

        $selectedBranchId = $request->input('branch_id');

        if (!$selectedBranchId && $branches->isNotEmpty()) {
            $mainBranch = $branches->firstWhere('is_main', true);
            $selectedBranchId = $mainBranch?->id ?? $branches->first()->id;
        }

        $activeDrawer = CashDrawer::where('tenant_id', $tenantId)
            ->where('status', 'open')
            ->when($selectedBranchId, fn ($q) => $q->where('branch_id', $selectedBranchId))
            ->latest('opened_at')
            ->first();

        $transactions = CashDrawerTransaction::query()
            ->when($activeDrawer, fn ($q) => $q->where('cash_drawer_id', $activeDrawer->id))
            ->when(!$activeDrawer, fn ($q) => $q->whereRaw('1 = 0'))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $availableChangeFund = 0;
        $availableCashSales = 0;

        if ($activeDrawer) {
            $availableCashSales = round((float) CashDrawerTransaction::where('cash_drawer_id', $activeDrawer->id)
                ->where('type', 'cash_sale')
                ->whereNull('withdrawn_at')
                ->sum('amount'), 2);

            $totalChangeFund = round((float) $activeDrawer->opening_balance + (float) $activeDrawer->total_cash_in, 2);

            $changeFundCashOut = round((float) CashDrawerTransaction::where('cash_drawer_id', $activeDrawer->id)
                ->where('type', 'cash_out')
                ->where('cash_out_source', 'change_fund')
                ->sum('amount'), 2);

            $availableChangeFund = max(0, round($totalChangeFund - $changeFundCashOut, 2));
        }

        return Inertia::render('owner/sales/cash-drawer/index', [
            'branches' => $branches,
            'selectedBranchId' => $selectedBranchId,
            'activeDrawer' => $activeDrawer,
            'transactions' => $transactions,
            'availableChangeFund' => $availableChangeFund,
            'availableCashSales' => $availableCashSales,
            'filters' => [
                'branch_id' => $selectedBranchId,
            ],
        ]);
    }

    public function open(Request $request)
    {
        $tenantId = auth()->user()->tenantId();

        $validated = $request->validate([
            'branch_id' => ['required', 'integer'],
            'opening_balance' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $branch = Branch::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->where('id', $validated['branch_id'])
            ->first();

        if (!$branch) {
            return back()->withErrors([
                'branch_id' => 'Invalid branch selected.',
            ]);
        }

        $existing = CashDrawer::where('tenant_id', $tenantId)
            ->where('branch_id', $validated['branch_id'])
            ->where('status', 'open')
            ->exists();

        if ($existing) {
            return back()->withErrors([
                'opening_balance' => 'There is already an open cash drawer for this branch.',
            ]);
        }

        DB::connection('pos')->transaction(function () use ($validated, $tenantId) {
            $amount = round((float) $validated['opening_balance'], 2);

            $drawer = CashDrawer::create([
                'tenant_id' => $tenantId,
                'branch_id' => $validated['branch_id'],
                'opened_by' => auth()->id(),
                'closed_by' => null,
                'opening_balance' => $amount,
                'expected_balance' => $amount,
                'actual_balance' => null,
                'variance_amount' => null,
                'total_cash_sales' => 0,
                'total_refunds' => 0,
                'total_cash_in' => 0,
                'total_cash_out' => 0,
                'status' => 'open',
                'opened_at' => now(),
                'closed_at' => null,
                'notes' => $validated['notes'] ?? null,
            ]);

            CashDrawerTransaction::create([
                'tenant_id' => $tenantId,
                'cash_drawer_id' => $drawer->id,
                'type' => 'opening',
                'amount' => $amount,
                'remarks' => 'Opening cash drawer / starting pang-barya',
                'created_by' => auth()->id(),
            ]);
        });

        return $this->redirectToDrawer($validated['branch_id'])
            ->with('success', 'Cash drawer opened successfully.');
    }

    public function cashIn(Request $request)
    {
        return $this->cashMovement($request, 'cash_in');
    }

    public function cashOut(Request $request)
    {
        return $this->cashMovement($request, 'cash_out');
    }

    public function close(Request $request)
    {
        $tenantId = auth()->user()->tenantId();

        $validated = $request->validate([
            'branch_id' => ['required', 'integer'],
            'actual_balance' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        try {
            DB::connection('pos')->transaction(function () use ($tenantId, $validated) {
                $drawer = CashDrawer::where('tenant_id', $tenantId)
                    ->where('branch_id', $validated['branch_id'])
                    ->where('status', 'open')
                    ->lockForUpdate()
                    ->first();

                if (!$drawer) {
                    throw new \Exception('No active cash drawer to close for this branch.');
                }

                $expected = round((float) $drawer->expected_balance, 2);
                $actual = round((float) $validated['actual_balance'], 2);

                $drawer->update([
                    'actual_balance' => $actual,
                    'variance_amount' => round($actual - $expected, 2),
                    'closed_by' => auth()->id(),
                    'closed_at' => now(),
                    'status' => 'closed',
                    'notes' => $validated['notes'] ?? $drawer->notes,
                ]);

                CashDrawerTransaction::create([
                    'tenant_id' => $drawer->tenant_id,
                    'cash_drawer_id' => $drawer->id,
                    'type' => 'closing_adjustment',
                    'amount' => round($actual - $expected, 2),
                    'remarks' => 'Cash drawer closed',
                    'created_by' => auth()->id(),
                ]);
            });
        } catch (\Exception $e) {
            return back()->withErrors([
                'actual_balance' => $e->getMessage(),
            ]);
        }

        return $this->redirectToDrawer($validated['branch_id'])
            ->with('success', 'Cash drawer closed successfully.');
    }

    private function cashMovement(Request $request, string $type)
    {
        $tenantId = auth()->user()->tenantId();

        $validated = $request->validate([
            'branch_id' => ['required', 'integer'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'cash_out_source' => ['nullable', 'in:change_fund,cash_sales'],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ]);

        $branch = Branch::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->where('id', $validated['branch_id'])
            ->first();

        if (!$branch) {
            return back()->withErrors([
                'branch_id' => 'Invalid branch selected.',
            ]);
        }

        try {
            DB::connection('pos')->transaction(function () use ($tenantId, $validated, $type) {
                $drawer = CashDrawer::where('tenant_id', $tenantId)
                    ->where('branch_id', $validated['branch_id'])
                    ->where('status', 'open')
                    ->lockForUpdate()
                    ->first();

                if (!$drawer) {
                    $drawer = CashDrawer::create([
                        'tenant_id' => $tenantId,
                        'branch_id' => $validated['branch_id'],
                        'opened_by' => auth()->id(),
                        'opening_balance' => 0,
                        'expected_balance' => 0,
                        'actual_balance' => null,
                        'variance_amount' => null,
                        'total_cash_sales' => 0,
                        'total_refunds' => 0,
                        'total_cash_in' => 0,
                        'total_cash_out' => 0,
                        'status' => 'open',
                        'opened_at' => now(),
                        'closed_at' => null,
                        'notes' => 'DEV AUTO OPEN DRAWER',
                    ]);
                }

                $amount = round((float) $validated['amount'], 2);
                $currentBalance = round((float) $drawer->expected_balance, 2);

                if ($type === 'cash_out') {
                    $source = $validated['cash_out_source'] ?? 'change_fund';

                    if ($currentBalance <= 0) {
                        throw new \Exception('Cannot cash out. Walang laman ang cash drawer.');
                    }

                    if ($amount > $currentBalance) {
                        throw new \Exception('Cannot cash out. Kulang ang current drawer balance.');
                    }

                    if ($source === 'cash_sales') {
                        $availableSales = round((float) CashDrawerTransaction::where('cash_drawer_id', $drawer->id)
                            ->where('type', 'cash_sale')
                            ->whereNull('withdrawn_at')
                            ->sum('amount'), 2);

                        if ($amount > $availableSales) {
                            throw new \Exception('Cannot cash out from sales. Kulang ang unwithdrawn cash sales.');
                        }

                        $this->markCashSalesAsWithdrawn($drawer->id, $amount);
                        $remarks = $validated['remarks'] ?: 'Cash out from sales';
                    } else {
                        $totalChangeFund = round((float) $drawer->opening_balance + (float) $drawer->total_cash_in, 2);

                        $changeFundCashOut = round((float) CashDrawerTransaction::where('cash_drawer_id', $drawer->id)
                            ->where('type', 'cash_out')
                            ->where('cash_out_source', 'change_fund')
                            ->sum('amount'), 2);

                        $availableChangeFund = max(0, round($totalChangeFund - $changeFundCashOut, 2));

                        if ($amount > $availableChangeFund) {
                            throw new \Exception('Cannot cash out from pang-barya. Kulang ang pang-barya fund.');
                        }

                        $remarks = $validated['remarks'] ?: 'Cash out from pang-barya';
                    }

                    $drawer->increment('total_cash_out', $amount);
                    $drawer->decrement('expected_balance', $amount);

                    CashDrawerTransaction::create([
                        'tenant_id' => $drawer->tenant_id,
                        'cash_drawer_id' => $drawer->id,
                        'type' => 'cash_out',
                        'cash_out_source' => $source,
                        'amount' => $amount,
                        'remarks' => $remarks,
                        'created_by' => auth()->id(),
                    ]);

                    return;
                }

                $drawer->increment('total_cash_in', $amount);
                $drawer->increment('expected_balance', $amount);

                CashDrawerTransaction::create([
                    'tenant_id' => $drawer->tenant_id,
                    'cash_drawer_id' => $drawer->id,
                    'type' => 'cash_in',
                    'amount' => $amount,
                    'remarks' => $validated['remarks'] ?: 'Add cash / pang-barya',
                    'created_by' => auth()->id(),
                ]);
            });
        } catch (\Exception $e) {
            return back()->withErrors([
                'amount' => $e->getMessage(),
            ]);
        }

        return $this->redirectToDrawer($validated['branch_id'])
            ->with('success', 'Cash drawer updated successfully.');
    }

    private function markCashSalesAsWithdrawn(int $drawerId, float $amount): void
    {
        $remaining = round($amount, 2);

        $sales = CashDrawerTransaction::where('cash_drawer_id', $drawerId)
            ->where('type', 'cash_sale')
            ->whereNull('withdrawn_at')
            ->oldest()
            ->get();

        foreach ($sales as $sale) {
            if ($remaining <= 0) {
                break;
            }

            $saleAmount = round((float) $sale->amount, 2);

            if ($remaining >= $saleAmount) {
                $sale->update([
                    'withdrawn_at' => now(),
                    'withdrawn_by' => auth()->id(),
                ]);

                $remaining = round($remaining - $saleAmount, 2);
            }
        }
    }

    public static function recordCashSale(
        int $tenantId,
        float $amount,
        ?int $branchId = null,
        ?string $referenceType = null,
        ?int $referenceId = null,
        ?int $createdBy = null
    ): void {
        $amount = round($amount, 2);

        if ($amount <= 0 || !$branchId) {
            return;
        }

        DB::connection('pos')->transaction(function () use ($tenantId, $amount, $branchId, $referenceType, $referenceId, $createdBy) {
            $drawer = CashDrawer::where('tenant_id', $tenantId)
                ->where('branch_id', $branchId)
                ->where('status', 'open')
                ->lockForUpdate()
                ->latest('opened_at')
                ->first();

            if (!$drawer) {
                $drawer = CashDrawer::create([
                    'tenant_id' => $tenantId,
                    'branch_id' => $branchId,
                    'opened_by' => $createdBy,
                    'opening_balance' => 0,
                    'expected_balance' => 0,
                    'actual_balance' => null,
                    'variance_amount' => null,
                    'total_cash_sales' => 0,
                    'total_refunds' => 0,
                    'total_cash_in' => 0,
                    'total_cash_out' => 0,
                    'status' => 'open',
                    'opened_at' => now(),
                    'closed_at' => null,
                    'notes' => 'DEV AUTO OPEN FROM CASH SALE',
                ]);
            }

            $drawer->increment('total_cash_sales', $amount);
            $drawer->increment('expected_balance', $amount);

            CashDrawerTransaction::create([
                'tenant_id' => $drawer->tenant_id,
                'cash_drawer_id' => $drawer->id,
                'type' => 'cash_sale',
                'amount' => $amount,
                'reference_type' => $referenceType,
                'reference_id' => $referenceId,
                'remarks' => 'Cash sale added to drawer',
                'created_by' => $createdBy,
            ]);
        });
    }

    private function redirectToDrawer(int|string $branchId)
    {
        return redirect()->to($this->cashDrawerUrl . '?branch_id=' . $branchId);
    }
}