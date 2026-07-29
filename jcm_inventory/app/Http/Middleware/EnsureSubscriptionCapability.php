<?php

namespace App\Http\Middleware;

use App\Services\Subscriptions\SubscriptionAccessService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class EnsureSubscriptionCapability
{
    public function __construct(
        private readonly SubscriptionAccessService $subscriptions
    ) {
    }

    public function handle(
        Request $request,
        Closure $next,
        string $capability
    ): Response {
        $user = $request->user();

        if ($user === null) {
            return to_route('login');
        }

        $context =
            $this->subscriptions->summary(
                $user
            );

        if (
            $context === null
            || $context['access_mode']
                === 'blocked'
        ) {
            return to_route(
                'subscription.index'
            )->with(
                'error',
                'Choose or renew a plan to continue using JCM Inventory.'
            );
        }

        $allowed = match ($capability) {
            'read' => in_array(
                $context['access_mode'],
                [
                    'full',
                    'read_only',
                ],
                true
            ),

            'active',
            'write',
            'export' =>
                $context['access_mode']
                    === 'full',

            default => false,
        };

        if (! $allowed) {
            $message = match (
                $capability
            ) {
                'active' =>
                    'This module is unavailable while the subscription is read-only. Renew the owner subscription to unlock it.',

                'export' =>
                    'PDF and Excel exports are unavailable while the subscription is read-only.',

                'write' =>
                    'Your subscription is read-only. Renew the owner subscription to make changes.',

                default =>
                    'Your subscription does not allow this action.',
            };

            return to_route(
                'subscription.index'
            )->with(
                'error',
                $message
            );
        }

        $request->attributes->set(
            'jcm_product_access',
            $context
        );

        $request->attributes->set(
            'jcm_subscription_capability',
            $capability
        );

        return $next($request);
    }
}
