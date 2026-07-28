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

    private function connection(): ConnectionInterface
    {
        return DB::connection(
            (string) config('jcm.saas_connection', 'saas')
        );
    }
}
