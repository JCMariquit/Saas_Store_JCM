<?php

namespace App\Http\Controllers\Staff\Cashier;

use App\Http\Controllers\Controller;
use App\Models\CashDrawer;
use App\Models\CashDrawerTransaction;
use App\Support\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CashierCashDrawerController extends Controller
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

    public function index()
    {
        $tenantId = $this->tenantId();
        $branchId = $this->branchId();
        $cashierId = (int) auth()->id();

        $openDrawer = CashDrawer::query()
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->where('opened_by', $cashierId)
            ->where('status', 'open')
            ->latest('opened_at')
            ->first();

        $drawers = CashDrawer::query()
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->where('opened_by', $cashierId)
            ->latest('opened_at')
            ->paginate(10)
            ->withQueryString();

        $transactions = CashDrawerTransaction::query()
            ->from('cash_drawer_transactions as cdt')
            ->join('cash_drawers as cd', 'cd.id', '=', 'cdt.cash_drawer_id')
            ->where('cd.tenant_id', $tenantId)
            ->where('cd.branch_id', $branchId)
            ->where('cd.opened_by', $cashierId)
            ->select([
                'cdt.*',
                'cd.status as drawer_status',
                'cd.opened_at as drawer_opened_at',
            ])
            ->latest('cdt.created_at')
            ->limit(25)
            ->get();

        return Inertia::render('staff/cashier/cash-drawer/index', [
            'openDrawer' => $openDrawer,
            'drawers' => $drawers,
            'transactions' => $transactions,
        ]);
    }

    public function open(Request $request)
    {
        $validated = $request->validate([
            'opening_balance' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $tenantId = $this->tenantId();
        $branchId = $this->branchId();
        $cashierId = (int) auth()->id();

        $existingOpenDrawer = CashDrawer::query()
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->where('opened_by', $cashierId)
            ->where('status', 'open')
            ->first();

        if ($existingOpenDrawer) {
            return back()->withErrors([
                'drawer' => 'You already have an open cash drawer.',
            ]);
        }

        $openingBalance = round((float) $validated['opening_balance'], 2);

        $drawer = CashDrawer::create([
            'tenant_id' => $tenantId,
            'branch_id' => $branchId,
            'opened_by' => $cashierId,
            'closed_by' => null,
            'opening_balance' => $openingBalance,
            'expected_balance' => $openingBalance,
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
            'type' => 'opening_balance',
            'amount' => $openingBalance,
            'reference_type' => 'cash_drawer',
            'reference_id' => $drawer->id,
            'remarks' => 'Opening balance.',
            'created_by' => $cashierId,
        ]);

        ActivityLogger::log(
            module: 'cashier_cash_drawer',
            action: 'opened',
            description: 'Cashier opened cash drawer.',
            properties: [
                'cash_drawer_id' => $drawer->id,
                'opening_balance' => $openingBalance,
            ]
        );

        return back()->with('success', 'Cash drawer opened successfully.');
    }

    public function cashIn(Request $request)
    {
        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01'],
            'remarks' => ['nullable', 'string', 'max:500'],
        ]);

        $tenantId = $this->tenantId();
        $branchId = $this->branchId();
        $cashierId = (int) auth()->id();

        DB::connection('pos')->transaction(function () use ($validated, $tenantId, $branchId, $cashierId) {
            $drawer = $this->openDrawerForUpdate($tenantId, $branchId, $cashierId);

            $amount = round((float) $validated['amount'], 2);

            CashDrawerTransaction::create([
                'tenant_id' => $tenantId,
                'cash_drawer_id' => $drawer->id,
                'type' => 'cash_in',
                'amount' => $amount,
                'reference_type' => 'manual',
                'reference_id' => null,
                'remarks' => $validated['remarks'] ?? 'Manual cash in.',
                'created_by' => $cashierId,
            ]);

            $drawer->update([
                'total_cash_in' => round((float) $drawer->total_cash_in + $amount, 2),
                'expected_balance' => round((float) $drawer->expected_balance + $amount, 2),
            ]);

            ActivityLogger::log(
                module: 'cashier_cash_drawer',
                action: 'cash_in',
                description: 'Cashier added cash to drawer.',
                properties: [
                    'cash_drawer_id' => $drawer->id,
                    'amount' => $amount,
                ]
            );
        });

        return back()->with('success', 'Cash in recorded successfully.');
    }

    public function cashOut(Request $request)
    {
        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01'],
            'cash_out_source' => ['required', 'in:change_fund,sales'],
            'remarks' => ['nullable', 'string', 'max:500'],
        ]);

        $tenantId = $this->tenantId();
        $branchId = $this->branchId();
        $cashierId = (int) auth()->id();

        DB::connection('pos')->transaction(function () use ($validated, $tenantId, $branchId, $cashierId) {
            $drawer = $this->openDrawerForUpdate($tenantId, $branchId, $cashierId);

            $amount = round((float) $validated['amount'], 2);

            if ($amount > (float) $drawer->expected_balance) {
                return back()->withErrors([
                    'amount' => 'Cash out amount cannot exceed expected drawer balance.',
                ]);
            }

            CashDrawerTransaction::create([
                'tenant_id' => $tenantId,
                'cash_drawer_id' => $drawer->id,
                'type' => 'cash_out',
                'cash_out_source' => $validated['cash_out_source'],
                'amount' => $amount,
                'reference_type' => 'manual',
                'reference_id' => null,
                'remarks' => $validated['remarks'] ?? 'Manual cash out.',
                'withdrawn_at' => now(),
                'withdrawn_by' => $cashierId,
                'created_by' => $cashierId,
            ]);

            $drawer->update([
                'total_cash_out' => round((float) $drawer->total_cash_out + $amount, 2),
                'expected_balance' => round((float) $drawer->expected_balance - $amount, 2),
            ]);

            ActivityLogger::log(
                module: 'cashier_cash_drawer',
                action: 'cash_out',
                description: 'Cashier withdrew cash from drawer.',
                properties: [
                    'cash_drawer_id' => $drawer->id,
                    'amount' => $amount,
                    'cash_out_source' => $validated['cash_out_source'],
                ]
            );
        });

        return back()->with('success', 'Cash out recorded successfully.');
    }

    public function close(Request $request)
    {
        $validated = $request->validate([
            'actual_balance' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $tenantId = $this->tenantId();
        $branchId = $this->branchId();
        $cashierId = (int) auth()->id();

        DB::connection('pos')->transaction(function () use ($validated, $tenantId, $branchId, $cashierId) {
            $drawer = $this->openDrawerForUpdate($tenantId, $branchId, $cashierId);

            $actualBalance = round((float) $validated['actual_balance'], 2);
            $expectedBalance = round((float) $drawer->expected_balance, 2);
            $variance = round($actualBalance - $expectedBalance, 2);

            $drawer->update([
                'closed_by' => $cashierId,
                'actual_balance' => $actualBalance,
                'variance_amount' => $variance,
                'status' => 'closed',
                'closed_at' => now(),
                'notes' => $validated['notes'] ?? $drawer->notes,
            ]);

            ActivityLogger::log(
                module: 'cashier_cash_drawer',
                action: 'closed',
                description: 'Cashier closed cash drawer.',
                properties: [
                    'cash_drawer_id' => $drawer->id,
                    'expected_balance' => $expectedBalance,
                    'actual_balance' => $actualBalance,
                    'variance_amount' => $variance,
                ]
            );
        });

        return back()->with('success', 'Cash drawer closed successfully.');
    }

    private function openDrawerForUpdate(int $tenantId, int $branchId, int $cashierId): CashDrawer
    {
        $drawer = CashDrawer::query()
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->where('opened_by', $cashierId)
            ->where('status', 'open')
            ->latest('opened_at')
            ->lockForUpdate()
            ->first();

        abort_if(!$drawer, 422, 'No open cash drawer found.');

        return $drawer;
    }
}