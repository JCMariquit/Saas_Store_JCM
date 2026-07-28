<?php

namespace App\Http\Controllers\Subscriptions;

use App\Http\Controllers\Controller;
use App\Services\Subscriptions\SubscriptionAccessService;
use Illuminate\Database\ConnectionInterface;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

final class SubscriptionPaymentController extends Controller
{
    public function store(
        Request $request,
        SubscriptionAccessService $access
    ): RedirectResponse {
        $validated = $request->validate([
            'order_id' => [
                'required',
                'integer',
                'min:1',
            ],
            'payment_method_id' => [
                'required',
                'integer',
                'min:1',
            ],
            'reference_number' => [
                'nullable',
                'string',
                'max:150',
            ],
            'account_name' => [
                'nullable',
                'string',
                'max:255',
            ],
            'account_number' => [
                'nullable',
                'string',
                'max:100',
            ],
            'payment_proof' => [
                'required',
                'file',
                'image',
                'max:5120',
            ],
        ]);

        $context = $access->requireOwner($request->user());
        $connection = $this->connection();

        $order = $connection
            ->table('orders')
            ->where('id', $validated['order_id'])
            ->where(
                'account_owner_id',
                $context['account_owner_id']
            )
            ->whereIn('status', [
                'pending',
                'payment_submitted',
            ])
            ->first();

        if ($order === null) {
            throw ValidationException::withMessages([
                'order_id' =>
                    'The selected subscription order is unavailable.',
            ]);
        }

        $paymentMethod = $connection
            ->table('payment_methods')
            ->where('id', $validated['payment_method_id'])
            ->where('status', 1)
            ->first();

        if ($paymentMethod === null) {
            throw ValidationException::withMessages([
                'payment_method_id' =>
                    'The selected payment method is unavailable.',
            ]);
        }

        $alreadySubmitted = $connection
            ->table('transactions')
            ->where('order_id', $order->id)
            ->whereIn('status', [
                'submitted',
                'verified',
            ])
            ->exists();

        if ($alreadySubmitted) {
            throw ValidationException::withMessages([
                'payment_proof' =>
                    'This order already has a submitted payment.',
            ]);
        }

        $proofPath = $request
            ->file('payment_proof')
            ->store(
                sprintf(
                    'subscription-payments/%d',
                    $context['account_owner_id']
                ),
                'public'
            );

        try {
            $connection->transaction(function () use (
                $connection,
                $request,
                $validated,
                $order,
                $paymentMethod,
                $proofPath
            ): void {
                $connection
                    ->table('transactions')
                    ->insert([
                        'transaction_code' => sprintf(
                            'TXN-SUB-%s-%s',
                            now()->format('YmdHis'),
                            Str::upper(Str::random(8))
                        ),
                        'order_id' => $order->id,
                        'user_id' => $request->user()->getKey(),
                        'payment_method_id' => $paymentMethod->id,
                        'reference_number' =>
                            $validated['reference_number'] ?? null,
                        'account_name' =>
                            $validated['account_name'] ?? null,
                        'account_number' =>
                            $validated['account_number'] ?? null,
                        'amount' => $order->amount,
                        'payment_proof' => $proofPath,
                        'status' => 'submitted',
                        'submitted_at' => now(),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                $connection
                    ->table('orders')
                    ->where('id', $order->id)
                    ->update([
                        'status' => 'payment_submitted',
                        'updated_at' => now(),
                    ]);
            });
        } catch (\Throwable $exception) {
            Storage::disk('public')->delete($proofPath);
            throw $exception;
        }

        return to_route('subscription.index')->with(
            'success',
            'Payment proof submitted for administrator verification.'
        );
    }

    private function connection(): ConnectionInterface
    {
        return DB::connection(
            (string) config('jcm.saas_connection', 'saas')
        );
    }
}
