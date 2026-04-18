<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        $transactions = Transaction::with(['user', 'order.product', 'order.plan'])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('transaction_code', 'like', "%{$search}%")
                        ->orWhere('reference_number', 'like', "%{$search}%")
                        ->orWhere('payment_method', 'like', "%{$search}%")
                        ->orWhere('status', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($subQ) use ($search) {
                            $subQ->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        })
                        ->orWhereHas('order', function ($subQ) use ($search) {
                            $subQ->where('order_code', 'like', "%{$search}%");
                        })
                        ->orWhereHas('order.product', function ($subQ) use ($search) {
                            $subQ->where('name', 'like', "%{$search}%");
                        })
                        ->orWhereHas('order.plan', function ($subQ) use ($search) {
                            $subQ->where('plan_name', 'like', "%{$search}%");
                        });
                });
            })
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString()
            ->through(fn ($transaction) => [
                'id' => $transaction->id,
                'transaction_code' => $transaction->transaction_code,
                'order_code' => $transaction->order?->order_code,
                'user_name' => $transaction->user?->name,
                'product_name' => $transaction->order?->product?->name,
                'plan_name' => $transaction->order?->plan?->plan_name,
                'payment_method' => $transaction->payment_method,
                'reference_number' => $transaction->reference_number,
                'account_name' => $transaction->account_name,
                'account_number' => $transaction->account_number,
                'amount' => $transaction->amount,
                'status' => $transaction->status,
                'notes' => $transaction->notes,
                'paid_at' => optional($transaction->paid_at)?->format('M d, Y h:i A'),
                'verified_at' => optional($transaction->verified_at)?->format('M d, Y h:i A'),
            ]);

        return Inertia::render('transactions/index', [
            'filters' => [
                'search' => $search,
            ],
            'transactions' => $transactions,
            'stats' => [
                'total_transactions' => Transaction::count(),
                'submitted_transactions' => Transaction::where('status', 'submitted')->count(),
                'verified_transactions' => Transaction::where('status', 'verified')->count(),
                'rejected_transactions' => Transaction::where('status', 'rejected')->count(),
            ],
        ]);
    }

    public function verify(Transaction $transaction): RedirectResponse
    {
        $transaction->update([
            'status' => 'verified',
            'verified_at' => now(),
        ]);

        if ($transaction->order) {
            $transaction->order->update([
                'status' => 'verified',
                'verified_at' => now(),
            ]);
        }

        return redirect()
            ->route('admin.transactions.index')
            ->with('success', 'Transaction verified successfully.');
    }

    public function reject(Request $request, Transaction $transaction): RedirectResponse
    {
        $validated = $request->validate([
            'notes' => ['nullable', 'string'],
        ]);

        $transaction->update([
            'status' => 'rejected',
            'notes' => $validated['notes'] ?? $transaction->notes,
        ]);

        if ($transaction->order) {
            $transaction->order->update([
                'status' => 'rejected',
                'notes' => $validated['notes'] ?? $transaction->order->notes,
            ]);
        }

        return redirect()
            ->route('admin.transactions.index')
            ->with('success', 'Transaction rejected.');
    }

    public function destroy(Transaction $transaction): RedirectResponse
    {
        $transaction->delete();

        return redirect()
            ->route('admin.transactions.index')
            ->with('success', 'Transaction deleted successfully.');
    }
}