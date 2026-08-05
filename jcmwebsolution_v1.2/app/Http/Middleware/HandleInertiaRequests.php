<?php

namespace App\Http\Middleware;

use App\Services\PlatformSidebarService;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();

        return array_merge(parent::share($request), [
            'name' => config('app.name'),
            'auth' => [
                'user' => $user,
                'isAdmin' => $user?->isAdmin() ?? false,
                'platformRole' => $user?->primaryPlatformRoleCode(),
            ],
            'adminSidebar' => fn () => $user?->isAdmin()
                ? app(PlatformSidebarService::class)->menuFor($user)
                : [],
        ]);
    }
}
