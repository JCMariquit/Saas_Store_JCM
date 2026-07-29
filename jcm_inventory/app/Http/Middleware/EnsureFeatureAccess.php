<?php

namespace App\Http\Middleware;

use App\Services\Subscriptions\SubscriptionAccessService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class EnsureFeatureAccess
{
    public function __construct(
        private readonly SubscriptionAccessService $subscriptions
    ) {
    }

    public function handle(
        Request $request,
        Closure $next,
        string $featureCode
    ): Response {
        $user = $request->user();

        if ($user === null) {
            return to_route('login');
        }

        $context = $this->subscriptions->summary($user);

        /*
        |--------------------------------------------------------------------------
        | No usable product membership or blocked subscription
        |--------------------------------------------------------------------------
        |
        | Redirect to billing instead of displaying a feature-level 403.
        |
        */

        if (
            $context === null
            || $context['access_mode'] === 'blocked'
        ) {
            return to_route('subscription.index')->with(
                'error',
                'Choose or renew a plan to continue using JCM Inventory.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Plan feature entitlement
        |--------------------------------------------------------------------------
        |
        | Expired/read-only subscriptions still retain their plan identity.
        | This check only determines whether the feature belongs to the plan.
        |
        */

        if (! $this->subscriptions->hasFeature(
            $user,
            $featureCode
        )) {
            abort(
                403,
                'This feature is not included in your current plan.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Read-only protection
        |--------------------------------------------------------------------------
        |
        | GET, HEAD, and OPTIONS remain available for expired/past-due users.
        | Write requests redirect to Subscription & Billing.
        |
        */

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
                'Your subscription is read-only. Renew the owner subscription to continue making changes.'
            );
        }

        $request->attributes->set(
            'jcm_product_access',
            $context
        );

        $request->attributes->set(
            'jcm_feature_code',
            $featureCode
        );

        return $next($request);
    }
}