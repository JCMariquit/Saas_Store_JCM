<?php

namespace App\Http\Controllers\Subscriptions;

use App\Http\Controllers\Controller;
use App\Services\Subscriptions\SubscriptionAccessService;
use Illuminate\Database\ConnectionInterface;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class SubscriptionActionController extends Controller
{
    public function cancelAtPeriodEnd(
        Request $request,
        SubscriptionAccessService $access
    ): RedirectResponse {
        $context = $access->requireOwner($request->user());
        $subscriptionId = $context['subscription_id'] ?? null;

        if ($subscriptionId === null) {
            throw ValidationException::withMessages([
                'subscription' => 'No active subscription was found.',
            ]);
        }

        $this->connection()
            ->table('subscriptions')
            ->where('id', $subscriptionId)
            ->whereIn('status', [
                'trial',
                'active',
                'past_due',
                'grace_period',
            ])
            ->update([
                'cancel_at_period_end' => 1,
                'updated_at' => now(),
            ]);

        return back()->with(
            'success',
            'Your subscription will stop at the end of its current period.'
        );
    }

    public function resume(
        Request $request,
        SubscriptionAccessService $access
    ): RedirectResponse {
        $context = $access->requireOwner($request->user());
        $subscriptionId = $context['subscription_id'] ?? null;

        if ($subscriptionId === null) {
            throw ValidationException::withMessages([
                'subscription' => 'No subscription was found.',
            ]);
        }

        $this->connection()
            ->table('subscriptions')
            ->where('id', $subscriptionId)
            ->update([
                'cancel_at_period_end' => 0,
                'cancelled_at' => null,
                'cancellation_reason' => null,
                'updated_at' => now(),
            ]);

        return back()->with(
            'success',
            'Your subscription will continue normally.'
        );
    }

    public function cancelCheckout(
        Request $request,
        int $order,
        SubscriptionAccessService $access
    ): RedirectResponse {
        $context = $access->requireOwner(
            $request->user()
        );

        $connection = $this->connection();

        $productCode = (string) config(
            'jcm.product_code',
            'JCM-INVENTORY-001'
        );

        $productId = $connection
            ->table('products')
            ->where(
                'product_code',
                $productCode
            )
            ->value('id');

        if ($productId === null) {
            throw ValidationException::withMessages([
                'order' =>
                    'The JCM Inventory product record was not found.',
            ]);
        }

        $connection->transaction(
            function () use (
                $connection,
                $context,
                $productId,
                $order
            ): void {
                $orderRecord = $connection
                    ->table('orders')
                    ->where('id', $order)
                    ->where(
                        'account_owner_id',
                        $context[
                            'account_owner_id'
                        ]
                    )
                    ->where(
                        'product_id',
                        $productId
                    )
                    ->where(
                        'status',
                        'pending'
                    )
                    ->lockForUpdate()
                    ->first([
                        'id',
                        'notes',
                    ]);

                if ($orderRecord === null) {
                    throw ValidationException::withMessages([
                        'order' =>
                            'Only a pending checkout can be cancelled.',
                    ]);
                }

                $existingNotes = trim(
                    (string) (
                        $orderRecord->notes ?? ''
                    )
                );

                $cancelNote = sprintf(
                    '[%s] Checkout cancelled by the account owner.',
                    now()->format(
                        'Y-m-d H:i:s'
                    )
                );

                $connection
                    ->table('transactions')
                    ->where(
                        'order_id',
                        $orderRecord->id
                    )
                    ->where(
                        'status',
                        'pending'
                    )
                    ->update([
                        'status' =>
                            'rejected',

                        'notes' =>
                            'Checkout was cancelled before payment submission.',

                        'updated_at' =>
                            now(),
                    ]);

                $connection
                    ->table('orders')
                    ->where(
                        'id',
                        $orderRecord->id
                    )
                    ->update([
                        'status' =>
                            'cancelled',

                        'notes' =>
                            $existingNotes !== ''
                                ? $existingNotes
                                    .PHP_EOL
                                    .$cancelNote
                                : $cancelNote,

                        'updated_at' =>
                            now(),
                    ]);
            }
        );

        return to_route(
            'subscription.index'
        );
    }

    private function connection(): ConnectionInterface
    {
        return DB::connection(
            (string) config('jcm.saas_connection', 'saas')
        );
    }
}
