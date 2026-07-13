<?php

namespace App\Http\Middleware;

use App\Services\DynamicSidebarService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template loaded on the first page visit.
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props shared with every Inertia page.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(
            Inspiring::quotes()->random()
        )->explode('-');

        return array_merge(parent::share($request), [
            'name' => config('app.name'),

            'quote' => [
                'message' => trim($message),
                'author' => trim($author),
            ],

            'auth' => [
                'user' => $request->user(),
            ],

            'sidebar' => fn (): array => $request->user()
                ? app(DynamicSidebarService::class)->forUser(
                    $request->user(),
                    config(
                        'jcm.product_code',
                        'JCM-INVENTORY-001'
                    )
                )
                : [
                    'product' => null,
                    'access' => null,
                    'subscription' => null,
                    'sections' => [],
                ],
        ]);
    }
}