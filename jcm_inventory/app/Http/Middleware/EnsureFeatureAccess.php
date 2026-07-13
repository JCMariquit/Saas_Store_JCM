<?php

namespace App\Http\Middleware;

use App\Services\DynamicSidebarService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class EnsureFeatureAccess
{
    public function __construct(
        private readonly DynamicSidebarService $sidebarService
    ) {
    }

    /**
     * Handle an incoming request.
     */
    public function handle(
        Request $request,
        Closure $next,
        string $featureCode
    ): Response {
        $user = $request->user();

        abort_unless(
            $user,
            401,
            'You must be logged in.'
        );

        $allowed = $this->sidebarService
            ->canAccessFeature(
                $user,
                config(
                    'jcm.product_code',
                    'JCM-INVENTORY-001'
                ),
                $featureCode
            );

        abort_unless(
            $allowed,
            403,
            'You do not have access to this feature.'
        );

        return $next($request);
    }
}