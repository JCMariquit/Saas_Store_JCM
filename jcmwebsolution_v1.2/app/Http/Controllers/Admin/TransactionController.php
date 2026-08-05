<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        $transactions = Transaction::query()
            ->with([
                'user:id,name,email',
                'paymentMethod:id,name,slug',
                'order:id,order_code,status,product_id,plan_id',
                'order.product:id,name',
                'order.plan:id,plan_name',
            ])
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($nested) use ($search): void {
                    $nested->where('transaction_code', 'like', "%{$search}%")
                        ->orWhere('reference_number', 'like', "%{$search}%")
                        ->orWhere('status', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($userQuery) use ($search): void {
                            $userQuery->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        })
                        ->orWhereHas('paymentMethod', function ($paymentQuery) use ($search): void {
                            $paymentQuery->where('name', 'like', "%{$search}%")
                                ->orWhere('slug', 'like', "%{$search}%");
                        })
                        ->orWhereHas('order', function ($orderQuery) use ($search): void {
                            $orderQuery->where('order_code', 'like', "%{$search}%");
                        });
                });
            })
            ->latest('id')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Transaction $transaction): array => [
                'id' => $transaction->id,
                'transaction_code' => $transaction->transaction_code,
                'order_id' => $transaction->order_id,
                'order_code' => $transaction->order?->order_code,
                'order_status' => $transaction->order?->status,
                'user_name' => $transaction->user?->name,
                'product_name' => $transaction->order?->product?->name,
                'plan_name' => $transaction->order?->plan?->plan_name,
                'payment_method' => $transaction->paymentMethod?->name,
                'reference_number' => $transaction->reference_number,
                'account_name' => $transaction->account_name,
                'account_number' => $transaction->account_number,
                'amount' => (float) $transaction->amount,
                'status' => $transaction->status,
                'notes' => $transaction->notes,
                'paid_at' => $transaction->paid_at?->format('M d, Y h:i A'),
                'verified_at' => $transaction->verified_at?->format('M d, Y h:i A'),
            ]);

        return Inertia::render('admin/transactions/index', [
            'filters' => ['search' => $search],
            'transactions' => $transactions,
            'stats' => [
                'total_transactions' => Transaction::count(),
                'submitted_transactions' => Transaction::whereIn('status', ['pending', 'submitted'])->count(),
                'verified_transactions' => Transaction::where('status', 'verified')->count(),
                'rejected_transactions' => Transaction::whereIn('status', ['rejected', 'failed'])->count(),
            ],
        ]);
    }

    public function reject(Request $request, Transaction $transaction): RedirectResponse
    {
        $validated = $request->validate([
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        if ($transaction->status === 'verified') {
            return back()->with('success', 'A verified transaction cannot be rejected.');
        }

        $transaction->update([
            'status' => 'rejected',
            'notes' => $validated['notes'] ?? $transaction->notes,
        ]);

        $transaction->order?->update([
            'status' => 'failed',
            'notes' => $validated['notes'] ?? $transaction->order?->notes,
        ]);

        return back()->with('success', 'Transaction rejected successfully.');
    }

    public function destroy(Transaction $transaction): RedirectResponse
    {
        if ($transaction->status === 'verified') {
            return back()->with('success', 'Verified transactions are retained for audit history.');
        }

        $order = $transaction->order;
        $transaction->delete();

        if ($order && ! $order->transactions()->exists() && $order->status === 'payment_submitted') {
            $order->update(['status' => 'pending', 'paid_at' => null]);
        }

        return back()->with('success', 'Transaction deleted successfully.');
    }
}
