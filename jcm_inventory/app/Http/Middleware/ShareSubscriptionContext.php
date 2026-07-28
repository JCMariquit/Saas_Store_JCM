<?php

namespace App\Http\Middleware;

use App\Services\Subscriptions\SubscriptionAccessService;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

final class ShareSubscriptionContext
{
    public function __construct(
        private readonly SubscriptionAccessService $access
    ) {
    }

    public function handle(
        Request $request,
        Closure $next
    ): Response {
        Inertia::share('subscription', function () use (
            $request
        ): ?array {
            $user = $request->user();

            return $user !== null
                ? $this->access->summary($user)
                : null;
        });

        return $next($request);
    }
}
