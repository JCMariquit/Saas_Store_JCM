<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\PlatformAuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class RefundController extends Controller
{
    public function __construct(private readonly PlatformAuditLogger $audit)
    {
    }

    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search'));
        $status = trim((string) $request->string('status'));

        $refunds = DB::table('refunds')
            ->leftJoin('transactions', 'transactions.id', '=', 'refunds.transaction_id')
            ->leftJoin('orders', 'orders.id', '=', 'refunds.order_id')
            ->join('users', 'users.id', '=', 'refunds.user_id')
            ->leftJoin('users as reviewers', 'reviewers.id', '=', 'refunds.reviewed_by')
            ->leftJoin('users as processors', 'processors.id', '=', 'refunds.processed_by')
            ->select([
                'refunds.id',
                'refunds.refund_code',
                'refunds.transaction_id',
                'refunds.order_id',
                'refunds.user_id',
                'refunds.amount',
                'refunds.currency',
                'refunds.reason',
                'refunds.status',
                'refunds.admin_notes',
                'refunds.requested_at',
                'refunds.reviewed_at',
                'refunds.processed_at',
                'refunds.created_at',
                'transactions.transaction_code',
                'transactions.amount as transaction_amount',
                'transactions.reference_number',
                'orders.order_code',
                'users.name as user_name',
                'users.email as user_email',
                'reviewers.name as reviewed_by_name',
                'processors.name as processed_by_name',
            ])
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($nested) use ($search): void {
                    $nested->where('refunds.refund_code', 'like', "%{$search}%")
                        ->orWhere('transactions.transaction_code', 'like', "%{$search}%")
                        ->orWhere('orders.order_code', 'like', "%{$search}%")
                        ->orWhere('users.name', 'like', "%{$search}%")
                        ->orWhere('users.email', 'like', "%{$search}%");
                });
            })
            ->when(in_array($status, ['requested', 'approved', 'rejected', 'processing', 'refunded', 'cancelled'], true), fn ($query) => $query->where('refunds.status', $status))
            ->orderByDesc('refunds.id')
            ->paginate(20)
            ->withQueryString();

        $transactions = DB::table('transactions')
            ->join('orders', 'orders.id', '=', 'transactions.order_id')
            ->join('users', 'users.id', '=', 'transactions.user_id')
            ->select([
                'transactions.id',
                'transactions.transaction_code',
                'transactions.order_id',
                'transactions.user_id',
                'transactions.amount',
                'transactions.status',
                'transactions.reference_number',
                'orders.order_code',
                'users.name as user_name',
                'users.email as user_email',
            ])
            ->whereIn('transactions.status', ['verified', 'refunded'])
            ->orderByDesc('transactions.id')
            ->limit(200)
            ->get()
            ->map(function (object $transaction): object {
                $alreadyRefunded = (float) DB::table('refunds')
                    ->where('transaction_id', $transaction->id)
                    ->whereIn('status', ['approved', 'processing', 'refunded'])
                    ->sum('amount');

                $transaction->refunded_amount = $alreadyRefunded;
                $transaction->refundable_amount = max(0, round((float) $transaction->amount - $alreadyRefunded, 2));

                return $transaction;
            })
            ->filter(fn (object $transaction): bool => $transaction->refundable_amount > 0)
            ->values();

        return Inertia::render('admin/refunds/index', [
            'refunds' => $refunds,
            'transactions' => $transactions,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'stats' => [
                'total' => DB::table('refunds')->count(),
                'requested' => DB::table('refunds')->where('status', 'requested')->count(),
                'processing' => DB::table('refunds')->whereIn('status', ['approved', 'processing'])->count(),
                'refunded_amount' => (float) DB::table('refunds')->where('status', 'refunded')->sum('amount'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'transaction_id' => ['required', 'integer', 'exists:transactions,id'],
            'amount' => ['required', 'numeric', 'min:0.01', 'max:999999999'],
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        $transaction = DB::table('transactions')->where('id', $validated['transaction_id'])->first();
        abort_unless($transaction, 404);
        abort_unless(in_array($transaction->status, ['verified', 'refunded'], true), 422, 'Only verified transactions can be refunded.');

        $alreadyRefunded = (float) DB::table('refunds')
            ->where('transaction_id', $transaction->id)
            ->whereIn('status', ['approved', 'processing', 'refunded'])
            ->sum('amount');
        $available = max(0, round((float) $transaction->amount - $alreadyRefunded, 2));
        $amount = round((float) $validated['amount'], 2);

        if ($amount > $available) {
            return back()->withErrors([
                'amount' => 'Refund amount exceeds the remaining refundable amount of '.number_format($available, 2).'.',
            ]);
        }

        $refundCode = $this->nextRefundCode();
        $id = DB::table('refunds')->insertGetId([
            'refund_code' => $refundCode,
            'transaction_id' => $transaction->id,
            'order_id' => $transaction->order_id,
            'user_id' => $transaction->user_id,
            'amount' => $amount,
            'currency' => 'PHP',
            'reason' => $validated['reason'],
            'status' => 'requested',
            'requested_by' => $request->user()?->getKey(),
            'requested_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->audit->write(
            $request,
            'refunds',
            'requested',
            "Created refund request {$refundCode}.",
            'refunds',
            $id,
            null,
            ['transaction_id' => $transaction->id, 'amount' => $amount, 'reason' => $validated['reason']],
        );

        return back()->with('success', 'Refund request created.');
    }

    public function review(Request $request, int $refund): RedirectResponse
    {
        $record = DB::table('refunds')->where('id', $refund)->first();
        abort_unless($record, 404);
        abort_unless($record->status === 'requested', 422, 'Only requested refunds can be reviewed.');

        $validated = $request->validate([
            'decision' => ['required', Rule::in(['approved', 'rejected'])],
            'admin_notes' => ['nullable', 'string', 'max:2000'],
        ]);

        DB::table('refunds')->where('id', $refund)->update([
            'status' => $validated['decision'],
            'admin_notes' => $validated['admin_notes'] ?: null,
            'reviewed_by' => $request->user()?->getKey(),
            'reviewed_at' => now(),
            'updated_at' => now(),
        ]);

        $this->audit->write(
            $request,
            'refunds',
            'reviewed',
            ucfirst($validated['decision'])." refund {$record->refund_code}.",
            'refunds',
            $refund,
            ['status' => $record->status],
            ['status' => $validated['decision'], 'admin_notes' => $validated['admin_notes'] ?? null],
        );

        return back()->with('success', 'Refund review saved.');
    }

    public function markProcessing(Request $request, int $refund): RedirectResponse
    {
        $record = DB::table('refunds')->where('id', $refund)->first();
        abort_unless($record, 404);
        abort_unless($record->status === 'approved', 422, 'Only approved refunds can be processed.');

        DB::table('refunds')->where('id', $refund)->update([
            'status' => 'processing',
            'updated_at' => now(),
        ]);

        $this->audit->write(
            $request,
            'refunds',
            'processing',
            "Started processing refund {$record->refund_code}.",
            'refunds',
            $refund,
            ['status' => $record->status],
            ['status' => 'processing'],
        );

        return back()->with('success', 'Refund moved to processing.');
    }

    public function complete(Request $request, int $refund): RedirectResponse
    {
        $record = DB::table('refunds')->where('id', $refund)->first();
        abort_unless($record, 404);
        abort_unless(in_array($record->status, ['approved', 'processing'], true), 422, 'Refund must be approved before completion.');

        DB::transaction(function () use ($record, $refund, $request): void {
            DB::table('refunds')->where('id', $refund)->update([
                'status' => 'refunded',
                'processed_by' => $request->user()?->getKey(),
                'processed_at' => now(),
                'updated_at' => now(),
            ]);

            if ($record->transaction_id) {
                $transaction = DB::table('transactions')->where('id', $record->transaction_id)->first();
                if ($transaction) {
                    $refundedTotal = (float) DB::table('refunds')
                        ->where('transaction_id', $record->transaction_id)
                        ->where('status', 'refunded')
                        ->sum('amount');

                    if ($refundedTotal >= (float) $transaction->amount) {
                        DB::table('transactions')->where('id', $record->transaction_id)->update([
                            'status' => 'refunded',
                            'refunded_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }
            }
        });

        $this->audit->write(
            $request,
            'refunds',
            'completed',
            "Completed refund {$record->refund_code}.",
            'refunds',
            $refund,
            ['status' => $record->status],
            ['status' => 'refunded'],
        );

        return back()->with('success', 'Refund completed.');
    }

    public function cancel(Request $request, int $refund): RedirectResponse
    {
        $record = DB::table('refunds')->where('id', $refund)->first();
        abort_unless($record, 404);
        abort_if($record->status === 'refunded', 422, 'A completed refund cannot be cancelled.');

        DB::table('refunds')->where('id', $refund)->update([
            'status' => 'cancelled',
            'updated_at' => now(),
        ]);

        $this->audit->write(
            $request,
            'refunds',
            'cancelled',
            "Cancelled refund {$record->refund_code}.",
            'refunds',
            $refund,
            ['status' => $record->status],
            ['status' => 'cancelled'],
        );

        return back()->with('success', 'Refund cancelled.');
    }

    private function nextRefundCode(): string
    {
        $prefix = 'RFD-'.now()->format('Ym').'-';
        $latest = DB::table('refunds')
            ->where('refund_code', 'like', $prefix.'%')
            ->orderByDesc('id')
            ->value('refund_code');

        $sequence = 1;
        if ($latest && preg_match('/(\d+)$/', (string) $latest, $matches)) {
            $sequence = ((int) $matches[1]) + 1;
        }

        return $prefix.str_pad((string) $sequence, 5, '0', STR_PAD_LEFT);
    }
}
