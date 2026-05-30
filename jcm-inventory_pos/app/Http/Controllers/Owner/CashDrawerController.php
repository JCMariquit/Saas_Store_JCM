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
    public function index()
    {
        $tenantId = auth()->user()->tenantId();

        $branches = Branch::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderByDesc('is_main')
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'is_main']);

        $activeDrawer = CashDrawer::where('tenant_id', $tenantId)
            ->where('status', 'open')
            ->latest('opened_at')
            ->first();

        $transactions = CashDrawerTransaction::query()
            ->when($activeDrawer, fn ($q) => $q->where('cash_drawer_id', $activeDrawer->id))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('owner/sales/cash-drawer/index', [
            'branches' => $branches,
            'activeDrawer' => $activeDrawer,
            'transactions' => $transactions,
        ]);
    }

    public function open(Request $request)
    {
        $tenantId = auth()->user()->tenantId();

        $validated = $request->validate([
            'branch_id' => ['nullable', 'integer'],
            'opening_balance' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $existing = CashDrawer::where('tenant_id', $tenantId)
            ->where('status', 'open')
            ->exists();

        if ($existing) {
            return back()->withErrors([
                'opening_balance' => 'There is already an open cash drawer.',
            ]);
        }

        DB::connection('pos')->transaction(function () use ($validated, $tenantId) {
            $drawer = CashDrawer::create([
                'tenant_id' => $tenantId,
                'branch_id' => $validated['branch_id'] ?? null,
                'opened_by' => auth()->id(),
                'opening_balance' => $validated['opening_balance'],
                'expected_balance' => $validated['opening_balance'],
                'status' => 'open',
                'opened_at' => now(),
                'notes' => $validated['notes'] ?? null,
            ]);

            CashDrawerTransaction::create([
                'tenant_id' => $tenantId,
                'cash_drawer_id' => $drawer->id,
                'type' => 'opening',
                'amount' => $validated['opening_balance'],
                'remarks' => 'Opening cash drawer balance',
                'created_by' => auth()->id(),
            ]);
        });

        return back()->with('success', 'Cash drawer opened successfully.');
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
            'actual_balance' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $drawer = CashDrawer::where('tenant_id', $tenantId)
            ->where('status', 'open')
            ->lockForUpdate()
            ->firstOrFail();

        DB::connection('pos')->transaction(function () use ($drawer, $validated) {
            $expected = (float) $drawer->expected_balance;
            $actual = (float) $validated['actual_balance'];

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

        return back()->with('success', 'Cash drawer closed successfully.');
    }

    private function cashMovement(Request $request, string $type)
    {
        $tenantId = auth()->user()->tenantId();

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01'],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ]);

        $drawer = CashDrawer::where('tenant_id', $tenantId)
            ->where('status', 'open')
            ->lockForUpdate()
            ->firstOrFail();

        DB::connection('pos')->transaction(function () use ($drawer, $validated, $type) {
            $amount = (float) $validated['amount'];

            if ($type === 'cash_in') {
                $drawer->increment('total_cash_in', $amount);
                $drawer->increment('expected_balance', $amount);
            }

            if ($type === 'cash_out') {
                $drawer->increment('total_cash_out', $amount);
                $drawer->decrement('expected_balance', $amount);
            }

            CashDrawerTransaction::create([
                'tenant_id' => $drawer->tenant_id,
                'cash_drawer_id' => $drawer->id,
                'type' => $type,
                'amount' => $amount,
                'remarks' => $validated['remarks'] ?? null,
                'created_by' => auth()->id(),
            ]);
        });

        return back()->with('success', 'Cash drawer updated successfully.');
    }
}