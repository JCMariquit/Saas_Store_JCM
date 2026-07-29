<?php

namespace App\Http\Middleware;

use App\Services\DynamicSidebarService;
use App\Services\Subscriptions\SubscriptionAccessService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class EnsureFeatureAccess
{
    private const PRODUCT_CODE =
        'JCM-INVENTORY-001';

    public function __construct(
        private readonly SubscriptionAccessService $subscriptions,
        private readonly DynamicSidebarService $sidebar
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

        /*
        |--------------------------------------------------------------------------
        | Plan and role feature access
        |--------------------------------------------------------------------------
        |
        | Expired/read-only subscriptions retain their plan identity, so a
        | Premium user can still be distinguished from a Basic user.
        |
        */

        if (
            ! $this->subscriptions
                ->hasFeature(
                    $user,
                    $featureCode
                )
        ) {
            $requiredPlan =
                $this->sidebar
                    ->requiredPlanForFeature(
                        $user,
                        self::PRODUCT_CODE,
                        $featureCode
                    );

            if ($requiredPlan !== null) {
                return to_route(
                    'subscription.index'
                )->with(
                    'error',
                    sprintf(
                        'This module is available on the %s plan. Upgrade your subscription to unlock it.',
                        $requiredPlan['name']
                    )
                )->with(
                    'upgrade_required',
                    [
                        'feature_code' =>
                            $featureCode,
                        'required_plan_id' =>
                            $requiredPlan['id'],
                        'required_plan_code' =>
                            $requiredPlan['code'],
                        'required_plan_name' =>
                            $requiredPlan['name'],
                    ]
                );
            }

            abort(
                403,
                'Your product role does not have access to this feature.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Read-only write protection
        |--------------------------------------------------------------------------
        |
        | GET, HEAD, and OPTIONS remain available unless the route separately
        | requires subscription.capability:active.
        |
        */

        if (
            $context['access_mode']
                === 'read_only'
            && ! in_array(
                $request->method(),
                [
                    'GET',
                    'HEAD',
                    'OPTIONS',
                ],
                true
            )
        ) {
            return to_route(
                'subscription.index'
            )->with(
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
