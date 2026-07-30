<?php

namespace App\Http\Controllers\Subscriptions;

use App\Http\Controllers\Controller;
use App\Services\Subscriptions\SubscriptionAccessService;
use App\Services\Subscriptions\SubscriptionCheckoutService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class SubscriptionCheckoutController extends Controller
{
    public function store(
        Request $request,
        SubscriptionCheckoutService $checkout,
        SubscriptionAccessService $access
    ): RedirectResponse {
        $validated = $request->validate([
            'plan_price_id' => [
                'required',
                'integer',
                'min:1',
            ],
        ]);

        $context = $access->summary(
            $request->user()
        );

        $connection = DB::connection(
            (string) config(
                'jcm.saas_connection',
                'saas'
            )
        );

        $selectedPlanId = $connection
            ->table('plan_prices')
            ->where(
                'id',
                (int) $validated[
                    'plan_price_id'
                ]
            )
            ->where(
                'status',
                'active'
            )
            ->value('plan_id');

        if ($selectedPlanId === null) {
            throw ValidationException::withMessages([
                'plan_price_id' =>
                    'The selected subscription price is unavailable.',
            ]);
        }

        $status = (string) (
            $context[
                'subscription_status'
            ] ?? ''
        );

        $isLive = (
            $context[
                'access_mode'
            ] ?? null
        ) === 'full'
            && in_array(
                $status,
                [
                    'active',
                    'trial',
                ],
                true
            );

        $periodEnd = $context[
            'current_period_end'
        ] ?? $context['end_date'] ?? null;

        $periodEndTimestamp =
            $periodEnd !== null
                ? strtotime(
                    (string) $periodEnd
                )
                : false;

        /*
         * For safety, an active/full subscription with no readable
         * period end is still considered active and unexpired.
         */
        $isUnexpired =
            $periodEndTimestamp === false
                || $periodEndTimestamp >
                    now()->timestamp;

        $sameCurrentPlan =
            (int) (
                $context['plan_id'] ?? 0
            ) === (int) $selectedPlanId;

        if (
            $sameCurrentPlan
            && $isLive
            && $isUnexpired
        ) {
            $formattedEnd =
                $periodEndTimestamp !== false
                    ? date(
                        'M d, Y',
                        $periodEndTimestamp
                    )
                    : null;

            throw ValidationException::withMessages([
                'plan_price_id' =>
                    $formattedEnd
                        ? sprintf(
                            'Your current plan is active until %s. Renewal becomes available after the current period ends.',
                            $formattedEnd
                        )
                        : 'Your current plan is still active. Renewal becomes available after the current period ends.',
            ]);
        }

        $checkout->createOrder(
            $request->user(),
            (int) $validated[
                'plan_price_id'
            ]
        );

        return to_route(
            'subscription.index'
        );
    }
}
