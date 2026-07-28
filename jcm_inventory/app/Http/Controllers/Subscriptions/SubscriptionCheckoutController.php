<?php

namespace App\Http\Controllers\Subscriptions;

use App\Http\Controllers\Controller;
use App\Services\Subscriptions\SubscriptionCheckoutService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

final class SubscriptionCheckoutController extends Controller
{
    public function store(
        Request $request,
        SubscriptionCheckoutService $checkout
    ): RedirectResponse {
        $validated = $request->validate([
            'plan_price_id' => [
                'required',
                'integer',
                'min:1',
            ],
        ]);

        $order = $checkout->createOrder(
            $request->user(),
            (int) $validated['plan_price_id']
        );

        return to_route('subscription.index')->with(
            'success',
            sprintf(
                'Order %s is ready. Submit your payment details.',
                $order->order_code
            )
        );
    }
}
