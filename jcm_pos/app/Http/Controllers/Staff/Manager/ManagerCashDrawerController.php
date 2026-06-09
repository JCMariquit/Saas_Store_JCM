<?php

namespace App\Http\Controllers\Staff\Manager;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\CashDrawer;
use App\Models\CashDrawerTransaction;
use App\Support\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ManagerCashDrawerController extends Controller
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

    private function openDrawer(int $tenantId, int $branchId): ?CashDrawer
    {
        return CashDrawer::query()
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->where('status', 'open')
            ->latest('opened_at')
            ->first();
    }

    private function availableChangeFund(CashDrawer $drawer): float
    {
        $withdrawn = CashDrawerTransaction::query()
            ->where('tenant_id', $drawer->tenant_id)
            ->where('cash_drawer_id', $drawer->id)
            ->where('type', 'cash_out')
            ->where('cash_out_source', 'change_fund')
            ->sum('amount');

        return max(((float) $drawer->opening_balance + (float) $drawer->total_cash_in) - (float) $withdrawn, 0);
    }

    private function availableCashSales(CashDrawer $drawer): float
    {
        $withdrawn = CashDrawerTransaction::query()
            ->where('tenant_id', $drawer->tenant_id)
            ->where('cash_drawer_id', $drawer->id)
            ->where('type', 'cash_out')
            ->where('cash_out_source', 'cash_sales')
            ->sum('amount');

        return max(((float) $drawer->total_cash_sales - (float) $drawer->total_refunds) - (float) $withdrawn, 0);
    }

    public function index()
    {
        $branch = $this->managerBranch();

        $tenantId = (int) $branch->tenant_id;
        $branchId = (int) $branch->id;

        $drawer = $this->openDrawer($tenantId, $branchId);

        $transactions = CashDrawerTransaction::query()
            ->where('tenant_id', $tenantId)
            ->when(
                $drawer,
                fn ($query) => $query->where('cash_drawer_id', $drawer->id),
                fn ($query) => $query->whereRaw('1 = 0')
            )
            ->latest()
            ->limit(25)
            ->get();

        $drawerHistory = CashDrawer::query()
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->latest('opened_at')
            ->limit(10)
            ->get();

        return Inertia::render('staff/manager/cash-drawer/index', [
            'branch' => $branch,
            'drawer' => $drawer,
            'transactions' => $transactions,
            'drawerHistory' => $drawerHistory,
            'availableChangeFund' => $drawer ? $this->availableChangeFund($drawer) : 0,
            'availableCashSales' => $drawer ? $this->availableCashSales($drawer) : 0,
        ]);
    }

    public function open(Request $request)
    {
        $branch = $this->managerBranch();

        $tenantId = (int) $branch->tenant_id;
        $branchId = (int) $branch->id;

        abort_if($this->openDrawer($tenantId, $branchId), 422, 'There is already an open cash drawer for this branch.');

        $validated = $request->validate([
            'opening_balance' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        DB::connection('pos')->transaction(function () use ($validated, $tenantId, $branchId) {
            $openingBalance = (float) $validated['opening_balance'];

            $drawer = CashDrawer::create([
                'tenant_id' => $tenantId,
                'branch_id' => $branchId,
                'opened_by' => auth()->id(),
                'opening_balance' => $openingBalance,
                'expected_balance' => $openingBalance,
                'actual_balance' => null,
                'variance_amount' => 0,
                'total_cash_sales' => 0,
                'total_refunds' => 0,
                'total_cash_in' => 0,
                'total_cash_out' => 0,
                'status' => 'open',
                'opened_at' => now(),
                'notes' => $validated['notes'] ?? null,
            ]);

            $transaction = CashDrawerTransaction::create([
                'tenant_id' => $tenantId,
                'cash_drawer_id' => $drawer->id,
                'type' => 'opening',
                'amount' => $openingBalance,
                'remarks' => 'Opening cash drawer balance',
                'created_by' => auth()->id(),
            ]);

            ActivityLogger::log(
                module: 'cash_drawer',
                action: 'opened',
                description: 'Opened cash drawer with ₱' . number_format($openingBalance, 2) . '.',
                subject: $drawer,
                properties: [
                    'drawer_id' => $drawer->id,
                    'transaction_id' => $transaction->id,
                    'amount' => $openingBalance,
                    'notes' => $validated['notes'] ?? null,
                ],
                tenantId: $tenantId,
                branchId: $branchId
            );
        });

        return back()->with('success', 'Cash drawer opened successfully.');
    }

    public function cashIn(Request $request)
    {
        $branch = $this->managerBranch();

        $tenantId = (int) $branch->tenant_id;
        $branchId = (int) $branch->id;

        $drawer = $this->openDrawer($tenantId, $branchId);

        abort_if(!$drawer, 422, 'No open cash drawer for this branch.');

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01'],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ]);

        DB::connection('pos')->transaction(function () use ($drawer, $validated, $tenantId, $branchId) {
            $amount = (float) $validated['amount'];

            $drawer->update([
                'total_cash_in' => (float) $drawer->total_cash_in + $amount,
                'expected_balance' => (float) $drawer->expected_balance + $amount,
            ]);

            $drawer->refresh();

            $transaction = CashDrawerTransaction::create([
                'tenant_id' => $tenantId,
                'cash_drawer_id' => $drawer->id,
                'type' => 'cash_in',
                'amount' => $amount,
                'remarks' => $validated['remarks'] ?: 'Cash in',
                'created_by' => auth()->id(),
            ]);

            ActivityLogger::log(
                module: 'cash_drawer',
                action: 'cash_in',
                description: 'Cash in ₱' . number_format($amount, 2) . '.',
                subject: $drawer,
                properties: [
                    'drawer_id' => $drawer->id,
                    'transaction_id' => $transaction->id,
                    'amount' => $amount,
                    'expected_balance' => (float) $drawer->expected_balance,
                    'remarks' => $validated['remarks'] ?: null,
                ],
                tenantId: $tenantId,
                branchId: $branchId
            );
        });

        return back()->with('success', 'Cash in recorded successfully.');
    }

    public function cashOut(Request $request)
    {
        $branch = $this->managerBranch();

        $tenantId = (int) $branch->tenant_id;
        $branchId = (int) $branch->id;

        $drawer = $this->openDrawer($tenantId, $branchId);

        abort_if(!$drawer, 422, 'No open cash drawer for this branch.');

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01'],
            'cash_out_source' => ['required', 'in:change_fund,cash_sales'],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ]);

        DB::connection('pos')->transaction(function () use ($drawer, $validated, $tenantId, $branchId) {
            $amount = (float) $validated['amount'];
            $source = $validated['cash_out_source'];
            $expectedBalance = (float) $drawer->expected_balance;

            $availableFromSource = $source === 'cash_sales'
                ? $this->availableCashSales($drawer)
                : $this->availableChangeFund($drawer);

            abort_if($amount > $availableFromSource, 422, 'Cash out amount cannot exceed available ' . str_replace('_', ' ', $source) . '.');
            abort_if($amount > $expectedBalance, 422, 'Cash out amount cannot exceed expected drawer balance.');

            $drawer->update([
                'total_cash_out' => (float) $drawer->total_cash_out + $amount,
                'expected_balance' => $expectedBalance - $amount,
            ]);

            $drawer->refresh();

            $transaction = CashDrawerTransaction::create([
                'tenant_id' => $tenantId,
                'cash_drawer_id' => $drawer->id,
                'type' => 'cash_out',
                'cash_out_source' => $source,
                'amount' => $amount,
                'remarks' => $validated['remarks'] ?: 'Cash out',
                'created_by' => auth()->id(),
                'withdrawn_at' => now(),
                'withdrawn_by' => auth()->id(),
            ]);

            ActivityLogger::log(
                module: 'cash_drawer',
                action: 'cash_out',
                description: 'Cash out ₱' . number_format($amount, 2) . ' from ' . str_replace('_', ' ', $source) . '.',
                subject: $drawer,
                properties: [
                    'drawer_id' => $drawer->id,
                    'transaction_id' => $transaction->id,
                    'amount' => $amount,
                    'source' => $source,
                    'expected_balance' => (float) $drawer->expected_balance,
                    'remarks' => $validated['remarks'] ?: null,
                ],
                tenantId: $tenantId,
                branchId: $branchId
            );
        });

        return back()->with('success', 'Cash out recorded successfully.');
    }

    public function close(Request $request)
    {
        $branch = $this->managerBranch();

        $tenantId = (int) $branch->tenant_id;
        $branchId = (int) $branch->id;

        $drawer = $this->openDrawer($tenantId, $branchId);

        abort_if(!$drawer, 422, 'No open cash drawer for this branch.');

        $validated = $request->validate([
            'actual_balance' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        DB::connection('pos')->transaction(function () use ($drawer, $validated, $tenantId, $branchId) {
            $actualBalance = (float) $validated['actual_balance'];
            $expectedBalance = (float) $drawer->expected_balance;
            $variance = $actualBalance - $expectedBalance;

            $drawer->update([
                'closed_by' => auth()->id(),
                'actual_balance' => $actualBalance,
                'variance_amount' => $variance,
                'status' => 'closed',
                'closed_at' => now(),
                'notes' => $validated['notes'] ?? $drawer->notes,
            ]);

            $drawer->refresh();

            $transaction = CashDrawerTransaction::create([
                'tenant_id' => $tenantId,
                'cash_drawer_id' => $drawer->id,
                'type' => 'closing_adjustment',
                'amount' => abs($variance),
                'remarks' => 'Drawer closed. Variance: ' . number_format($variance, 2),
                'created_by' => auth()->id(),
            ]);

            ActivityLogger::log(
                module: 'cash_drawer',
                action: 'closed',
                description: 'Closed cash drawer. Variance ₱' . number_format($variance, 2) . '.',
                subject: $drawer,
                properties: [
                    'drawer_id' => $drawer->id,
                    'transaction_id' => $transaction->id,
                    'expected_balance' => $expectedBalance,
                    'actual_balance' => $actualBalance,
                    'variance_amount' => $variance,
                    'notes' => $validated['notes'] ?? null,
                ],
                tenantId: $tenantId,
                branchId: $branchId
            );
        });

        return back()->with('success', 'Cash drawer closed successfully.');
    }
}