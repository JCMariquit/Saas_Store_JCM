<?php

namespace App\Http\Middleware;

use App\Services\Subscriptions\SubscriptionAccessService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class EnsureProductSubscription
{
    public function __construct(
        private readonly SubscriptionAccessService $access
    ) {
    }

    public function handle(
        Request $request,
        Closure $next
    ): Response {
        $user = $request->user();

        if ($user === null) {
            return $next($request);
        }

        $context = $this->access->summary($user);

        if (
            $context === null
            || $context['access_mode'] === 'blocked'
        ) {
            return to_route('subscription.index')->with(
                'error',
                'Choose or renew a plan to continue using JCM Inventory.'
            );
        }

        if (
            $context['access_mode'] === 'read_only'
            && ! in_array(
                $request->method(),
                ['GET', 'HEAD', 'OPTIONS'],
                true
            )
        ) {
            return to_route('subscription.index')->with(
                'error',
                'Your account is currently read-only. Renew the owner subscription to continue making changes.'
            );
        }

        $request->attributes->set(
            'jcm_product_access',
            $context
        );

        return $next($request);
    }
}
