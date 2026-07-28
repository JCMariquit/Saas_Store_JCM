<?php

namespace App\Http\Middleware;

use App\Services\DynamicSidebarService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Middleware;
use Throwable;

class HandleInertiaRequests extends Middleware
{
    private const PRODUCT_CODE =
        'JCM-INVENTORY-001';

    private const BRANDING_DISK =
        'public';

    /**
     * The root template loaded on the first page visit.
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(
        Request $request
    ): ?string {
        return parent::version($request);
    }

    /**
     * Define the props shared with every Inertia page.
     *
     * @return array<string, mixed>
     */
    public function share(
        Request $request
    ): array {
        [$message, $author] = str(
            Inspiring::quotes()->random()
        )->explode('-');

        $productCode = (string) config(
            'jcm.product_code',
            self::PRODUCT_CODE
        );

        $sidebar = $request->user()
            ? app(DynamicSidebarService::class)
                ->forUser(
                    $request->user(),
                    $productCode
                )
            : $this->emptySidebar();

        $businessProfile =
            $this->businessProfile(
                $sidebar
            );

        return array_merge(
            parent::share($request),
            [
                'name' =>
                    $businessProfile[
                        'businessName'
                    ],

                'quote' => [
                    'message' =>
                        trim($message),

                    'author' =>
                        trim($author),
                ],

                'auth' => [
                    'user' =>
                        $request->user(),
                ],

                'sidebar' =>
                    $sidebar,

                'businessProfile' =>
                    $businessProfile,
            ]
        );
    }

    /**
     * Resolve the account-level business identity used by
     * the application shell, sidebar, headers, and documents.
     *
     * @param array<string, mixed> $sidebar
     *
     * @return array{
     *     businessName: string,
     *     tagline: string|null,
     *     logoAltText: string|null,
     *     logoUrl: string|null,
     *     squareLogoUrl: string|null,
     *     faviconUrl: string|null
     * }
     */
    private function businessProfile(
        array $sidebar
    ): array {
        $fallbackName = trim(
            (string) data_get(
                $sidebar,
                'product.name',
                config(
                    'app.name',
                    'JCM Inventory'
                )
            )
        );

        if ($fallbackName === '') {
            $fallbackName =
                'JCM Inventory';
        }

        $fallback =
            $this->emptyBusinessProfile(
                $fallbackName
            );

        $accountOwnerId = (int) data_get(
            $sidebar,
            'access.accountOwnerId',
            0
        );

        if ($accountOwnerId <= 0) {
            return $fallback;
        }

        try {
            $profile = DB::connection('saas')
                ->table('users as owner')
                ->leftJoin(
                    'account_business_profiles as profile',
                    'profile.account_owner_id',
                    '=',
                    'owner.id'
                )
                ->leftJoin(
                    'account_business_branding as branding',
                    'branding.account_owner_id',
                    '=',
                    'owner.id'
                )
                ->where(
                    'owner.id',
                    $accountOwnerId
                )
                ->select([
                    'owner.name as owner_name',
                    'profile.business_name',
                    'branding.tagline',
                    'branding.logo_alt_text',
                    'branding.logo_disk',
                    'branding.logo_path',
                    'branding.square_logo_path',
                    'branding.favicon_path',
                ])
                ->first();
        } catch (Throwable) {
            return $fallback;
        }

        if (! $profile) {
            return $fallback;
        }

        $businessName = trim(
            (string) (
                $profile->business_name
                ?: $profile->owner_name
                ?: $fallbackName
            )
        );

        if ($businessName === '') {
            $businessName =
                $fallbackName;
        }

        $disk = trim(
            (string) (
                $profile->logo_disk
                ?: self::BRANDING_DISK
            )
        );

        if ($disk === '') {
            $disk =
                self::BRANDING_DISK;
        }

        return [
            'businessName' =>
                $businessName,

            'tagline' =>
                $this->nullableString(
                    $profile->tagline
                ),

            'logoAltText' =>
                $this->nullableString(
                    $profile->logo_alt_text
                ),

            'logoUrl' =>
                $this->fileUrl(
                    $disk,
                    $profile->logo_path
                ),

            'squareLogoUrl' =>
                $this->fileUrl(
                    $disk,
                    $profile
                        ->square_logo_path
                ),

            'faviconUrl' =>
                $this->fileUrl(
                    $disk,
                    $profile->favicon_path
                ),
        ];
    }

    /**
     * @return array{
     *     product: null,
     *     access: null,
     *     subscription: null,
     *     sections: array<int, mixed>
     * }
     */
    private function emptySidebar(): array
    {
        return [
            'product' => null,
            'access' => null,
            'subscription' => null,
            'sections' => [],
        ];
    }

    /**
     * @return array{
     *     businessName: string,
     *     tagline: null,
     *     logoAltText: null,
     *     logoUrl: null,
     *     squareLogoUrl: null,
     *     faviconUrl: null
     * }
     */
    private function emptyBusinessProfile(
        string $businessName
    ): array {
        return [
            'businessName' =>
                $businessName,

            'tagline' =>
                null,

            'logoAltText' =>
                null,

            'logoUrl' =>
                null,

            'squareLogoUrl' =>
                null,

            'faviconUrl' =>
                null,
        ];
    }

    private function fileUrl(
        string $disk,
        mixed $path
    ): ?string {
        $path =
            $this->nullableString($path);

        if (! $path) {
            return null;
        }

        try {
            if (
                ! Storage::disk($disk)
                    ->exists($path)
            ) {
                return null;
            }

            return Storage::disk($disk)
                ->url($path);
        } catch (Throwable) {
            return null;
        }
    }

    private function nullableString(
        mixed $value
    ): ?string {
        if (! is_string($value)) {
            return null;
        }

        $value = trim($value);

        return $value !== ''
            ? $value
            : null;
    }
}