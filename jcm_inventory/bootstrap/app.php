<?php

use App\Http\Middleware\EnsureFeatureAccess;
use App\Http\Middleware\EnsureProductSubscription;
use App\Http\Middleware\EnsureSubscriptionCapability;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\ShareSubscriptionContext;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(
    basePath: dirname(__DIR__)
)
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(
        function (Middleware $middleware): void {
            /*
            |--------------------------------------------------------------------------
            | Web middleware
            |--------------------------------------------------------------------------
            |
            | HandleInertiaRequests provides the standard Inertia shared props.
            | ShareSubscriptionContext adds the current canonical JCM product
            | access and owner subscription to every authenticated Inertia page.
            |
            */

            $middleware->web(append: [
                HandleInertiaRequests::class,
                ShareSubscriptionContext::class,
                AddLinkHeadersForPreloadedAssets::class,
            ]);

            /*
            |--------------------------------------------------------------------------
            | Custom middleware aliases
            |--------------------------------------------------------------------------
            |
            | feature:products
            |     Checks plan feature entitlement and existing feature rules.
            |
            | subscription.access
            |     Checks the owner's shared product subscription. Manager and
            |     Staff inherit the same owner subscription status.
            |
            */

            $middleware->alias([
                'feature' => EnsureFeatureAccess::class,
                'subscription.access' =>
                    EnsureProductSubscription::class,
                'subscription.capability' =>
                    EnsureSubscriptionCapability::class,
            ]);
        }
    )
    ->withExceptions(
        function (Exceptions $exceptions): void {
            //
        }
    )
    ->create();