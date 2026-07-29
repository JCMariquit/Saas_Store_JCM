<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class BusinessProfileController extends Controller
{
    private const PRODUCT_CODE = 'JCM-INVENTORY-001';

    private const BRANDING_DISK = 'public';

    /*
    |--------------------------------------------------------------------------
    | General Information
    |--------------------------------------------------------------------------
    */

    public function general(
        Request $request
    ): Response {
        $context = $this->ownerContext($request);

        $profile = DB::connection('saas')
            ->table('account_business_profiles')
            ->where(
                'account_owner_id',
                $context['account_owner_id']
            )
            ->first();

        return Inertia::render(
            'business-profile/general-information/index',
            [
                'profile' => [
                    'business_name' =>
                        (string) (
                            $profile?->business_name ?? ''
                        ),

                    'business_category' =>
                        (string) (
                            $profile?->business_category
                            ?? ''
                        ),

                    'short_description' =>
                        (string) (
                            $profile?->short_description
                            ?? ''
                        ),

                    'contact_email' =>
                        (string) (
                            $profile?->contact_email
                            ?? ''
                        ),

                    'contact_phone' =>
                        (string) (
                            $profile?->contact_phone
                            ?? ''
                        ),

                    'alternate_phone' =>
                        (string) (
                            $profile?->alternate_phone
                            ?? ''
                        ),

                    'website_url' =>
                        (string) (
                            $profile?->website_url
                            ?? ''
                        ),

                    'facebook_url' =>
                        (string) (
                            $profile?->facebook_url
                            ?? ''
                        ),

                    'address_line' =>
                        (string) (
                            $profile?->address_line
                            ?? ''
                        ),

                    'barangay' =>
                        (string) (
                            $profile?->barangay
                            ?? ''
                        ),

                    'city_municipality' =>
                        (string) (
                            $profile?->city_municipality
                            ?? ''
                        ),

                    'province' =>
                        (string) (
                            $profile?->province
                            ?? ''
                        ),

                    'postal_code' =>
                        (string) (
                            $profile?->postal_code
                            ?? ''
                        ),

                    'country_code' =>
                        (string) (
                            $profile?->country_code
                            ?? 'PH'
                        ),

                    'updated_at' =>
                        $profile?->updated_at,
                ],

                'owner' => [
                    'id' =>
                        $context['account_owner_id'],

                    'name' =>
                        $context['owner_name'],

                    'email' =>
                        $context['owner_email'],
                ],
            ]
        );
    }

    public function updateGeneral(
        Request $request
    ): RedirectResponse {
        $context = $this->ownerContext($request);

        $validated = $request->validate([
            'business_name' => [
                'required',
                'string',
                'max:180',
            ],

            'business_category' => [
                'nullable',
                'string',
                'max:120',
            ],

            'short_description' => [
                'nullable',
                'string',
                'max:2000',
            ],

            'contact_email' => [
                'nullable',
                'email:rfc',
                'max:180',
            ],

            'contact_phone' => [
                'nullable',
                'string',
                'max:50',
            ],

            'alternate_phone' => [
                'nullable',
                'string',
                'max:50',
            ],

            'website_url' => [
                'nullable',
                'url',
                'max:255',
            ],

            'facebook_url' => [
                'nullable',
                'url',
                'max:255',
            ],

            'address_line' => [
                'nullable',
                'string',
                'max:255',
            ],

            'barangay' => [
                'nullable',
                'string',
                'max:120',
            ],

            'city_municipality' => [
                'nullable',
                'string',
                'max:120',
            ],

            'province' => [
                'nullable',
                'string',
                'max:120',
            ],

            'postal_code' => [
                'nullable',
                'string',
                'max:20',
            ],

            'country_code' => [
                'required',
                'string',
                'size:2',
                'regex:/^[A-Za-z]{2}$/',
            ],
        ]);

        $ownerId = $context['account_owner_id'];
        $userId = $context['user_id'];
        $now = now();

        $payload = [
            'business_name' =>
                trim($validated['business_name']),

            'business_category' =>
                $this->nullableString(
                    $validated[
                        'business_category'
                    ] ?? null
                ),

            'short_description' =>
                $this->nullableString(
                    $validated[
                        'short_description'
                    ] ?? null
                ),

            'contact_email' =>
                $this->nullableString(
                    $validated[
                        'contact_email'
                    ] ?? null
                ),

            'contact_phone' =>
                $this->nullableString(
                    $validated[
                        'contact_phone'
                    ] ?? null
                ),

            'alternate_phone' =>
                $this->nullableString(
                    $validated[
                        'alternate_phone'
                    ] ?? null
                ),

            'website_url' =>
                $this->nullableString(
                    $validated[
                        'website_url'
                    ] ?? null
                ),

            'facebook_url' =>
                $this->nullableString(
                    $validated[
                        'facebook_url'
                    ] ?? null
                ),

            'address_line' =>
                $this->nullableString(
                    $validated[
                        'address_line'
                    ] ?? null
                ),

            'barangay' =>
                $this->nullableString(
                    $validated[
                        'barangay'
                    ] ?? null
                ),

            'city_municipality' =>
                $this->nullableString(
                    $validated[
                        'city_municipality'
                    ] ?? null
                ),

            'province' =>
                $this->nullableString(
                    $validated[
                        'province'
                    ] ?? null
                ),

            'postal_code' =>
                $this->nullableString(
                    $validated[
                        'postal_code'
                    ] ?? null
                ),

            'country_code' =>
                strtoupper(
                    trim(
                        $validated['country_code']
                    )
                ),

            'updated_by' => $userId,
            'updated_at' => $now,
        ];

        DB::connection('saas')
            ->transaction(
                function () use (
                    $ownerId,
                    $userId,
                    $now,
                    $payload
                ): void {
                    $query = DB::connection('saas')
                        ->table(
                            'account_business_profiles'
                        )
                        ->where(
                            'account_owner_id',
                            $ownerId
                        );

                    if ($query->exists()) {
                        $query->update($payload);

                        return;
                    }

                    DB::connection('saas')
                        ->table(
                            'account_business_profiles'
                        )
                        ->insert([
                            'account_owner_id' =>
                                $ownerId,

                            ...$payload,

                            'created_by' =>
                                $userId,

                            'created_at' =>
                                $now,
                        ]);
                }
            );

        return back()->with(
            'success',
            'Business information updated successfully.'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Branding
    |--------------------------------------------------------------------------
    */

    public function branding(
        Request $request
    ): Response {
        $context = $this->ownerContext($request);

        $branding = DB::connection('saas')
            ->table('account_business_branding')
            ->where(
                'account_owner_id',
                $context['account_owner_id']
            )
            ->first();

        $disk = (string) (
            $branding?->logo_disk
            ?: self::BRANDING_DISK
        );

        return Inertia::render(
            'business-profile/branding/index',
            [
                'branding' => [
                    'tagline' =>
                        (string) (
                            $branding?->tagline
                            ?? ''
                        ),

                    'logo_alt_text' =>
                        (string) (
                            $branding?->logo_alt_text
                            ?? ''
                        ),

                    'primary_color' =>
                        (string) (
                            $branding?->primary_color
                            ?? ''
                        ),

                    'secondary_color' =>
                        (string) (
                            $branding?->secondary_color
                            ?? ''
                        ),

                    'logo_url' =>
                        $this->fileUrl(
                            $disk,
                            $branding?->logo_path
                        ),

                    'square_logo_url' =>
                        $this->fileUrl(
                            $disk,
                            $branding
                                ?->square_logo_path
                        ),

                    'favicon_url' =>
                        $this->fileUrl(
                            $disk,
                            $branding?->favicon_path
                        ),

                    'updated_at' =>
                        $branding?->updated_at,
                ],

                'business_name' =>
                    (string) (
                        DB::connection('saas')
                            ->table(
                                'account_business_profiles'
                            )
                            ->where(
                                'account_owner_id',
                                $context[
                                    'account_owner_id'
                                ]
                            )
                            ->value('business_name')
                        ?? $context['owner_name']
                    ),
            ]
        );
    }

    public function updateBranding(
        Request $request
    ): RedirectResponse {
        $context = $this->ownerContext($request);

        $validated = $request->validate([
            'tagline' => [
                'nullable',
                'string',
                'max:180',
            ],

            'logo_alt_text' => [
                'nullable',
                'string',
                'max:180',
            ],

            'primary_color' => [
                'nullable',
                'regex:/^#[0-9A-Fa-f]{6}$/',
            ],

            'secondary_color' => [
                'nullable',
                'regex:/^#[0-9A-Fa-f]{6}$/',
            ],

            'logo' => [
                'nullable',
                'file',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],

            'square_logo' => [
                'nullable',
                'file',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],

            'favicon' => [
                'nullable',
                'file',
                'mimes:ico,png,jpg,jpeg,webp',
                'max:2048',
            ],

            'remove_logo' => [
                'nullable',
                'boolean',
            ],

            'remove_square_logo' => [
                'nullable',
                'boolean',
            ],

            'remove_favicon' => [
                'nullable',
                'boolean',
            ],
        ]);

        $ownerId = $context['account_owner_id'];
        $userId = $context['user_id'];
        $disk = self::BRANDING_DISK;

        $existing = DB::connection('saas')
            ->table('account_business_branding')
            ->where('account_owner_id', $ownerId)
            ->first();

        if (
            $existing
            && is_string($existing->logo_disk)
            && trim($existing->logo_disk) !== ''
        ) {
            $disk = $existing->logo_disk;
        }

        $paths = [
            'logo_path' =>
                $existing?->logo_path,

            'square_logo_path' =>
                $existing?->square_logo_path,

            'favicon_path' =>
                $existing?->favicon_path,
        ];

        $newFiles = [];
        $oldFilesToDelete = [];

        try {
            $paths['logo_path'] =
                $this->resolveBrandAsset(
                    request: $request,
                    fileField: 'logo',
                    removeField: 'remove_logo',
                    currentPath:
                        $paths['logo_path'],
                    disk: $disk,
                    ownerId: $ownerId,
                    newFiles: $newFiles,
                    oldFilesToDelete:
                        $oldFilesToDelete,
                );

            $paths['square_logo_path'] =
                $this->resolveBrandAsset(
                    request: $request,
                    fileField: 'square_logo',
                    removeField:
                        'remove_square_logo',
                    currentPath:
                        $paths[
                            'square_logo_path'
                        ],
                    disk: $disk,
                    ownerId: $ownerId,
                    newFiles: $newFiles,
                    oldFilesToDelete:
                        $oldFilesToDelete,
                );

            $paths['favicon_path'] =
                $this->resolveBrandAsset(
                    request: $request,
                    fileField: 'favicon',
                    removeField:
                        'remove_favicon',
                    currentPath:
                        $paths['favicon_path'],
                    disk: $disk,
                    ownerId: $ownerId,
                    newFiles: $newFiles,
                    oldFilesToDelete:
                        $oldFilesToDelete,
                );

            $now = now();

            $payload = [
                'tagline' =>
                    $this->nullableString(
                        $validated['tagline']
                        ?? null
                    ),

                'logo_disk' => $disk,

                'logo_path' =>
                    $paths['logo_path'],

                'square_logo_path' =>
                    $paths[
                        'square_logo_path'
                    ],

                'favicon_path' =>
                    $paths['favicon_path'],

                'logo_alt_text' =>
                    $this->nullableString(
                        $validated[
                            'logo_alt_text'
                        ] ?? null
                    ),

                'primary_color' =>
                    $this->normalizeColor(
                        $validated[
                            'primary_color'
                        ] ?? null
                    ),

                'secondary_color' =>
                    $this->normalizeColor(
                        $validated[
                            'secondary_color'
                        ] ?? null
                    ),

                'updated_by' => $userId,
                'updated_at' => $now,
            ];

            DB::connection('saas')
                ->transaction(
                    function () use (
                        $existing,
                        $ownerId,
                        $userId,
                        $now,
                        $payload
                    ): void {
                        if ($existing) {
                            DB::connection('saas')
                                ->table(
                                    'account_business_branding'
                                )
                                ->where(
                                    'account_owner_id',
                                    $ownerId
                                )
                                ->update($payload);

                            return;
                        }

                        DB::connection('saas')
                            ->table(
                                'account_business_branding'
                            )
                            ->insert([
                                'account_owner_id' =>
                                    $ownerId,

                                ...$payload,

                                'created_by' =>
                                    $userId,

                                'created_at' =>
                                    $now,
                            ]);
                    }
                );
        } catch (Throwable $throwable) {
            foreach (
                array_unique($newFiles)
                as $newFile
            ) {
                Storage::disk($disk)
                    ->delete($newFile);
            }

            throw $throwable;
        }

        foreach (
            array_unique($oldFilesToDelete)
            as $oldFile
        ) {
            if (
                is_string($oldFile)
                && trim($oldFile) !== ''
                && ! in_array(
                    $oldFile,
                    $paths,
                    true
                )
            ) {
                Storage::disk($disk)
                    ->delete($oldFile);
            }
        }

        return back()->with(
            'success',
            'Business branding updated successfully.'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    private function ownerContext(
        Request $request
    ): array {
        $userId = (int) (
            $request->user()?->id
        );

        abort_unless(
            $userId > 0,
            401
        );

        $context = DB::connection('saas')
            ->table(
                'user_product_access as access'
            )
            ->join(
                'products as product',
                'product.id',
                '=',
                'access.product_id'
            )
            ->join(
                'product_user_types as product_role',
                function ($join): void {
                    $join
                        ->on(
                            'product_role.id',
                            '=',
                            'access.product_user_type_id'
                        )
                        ->on(
                            'product_role.product_id',
                            '=',
                            'access.product_id'
                        );
                }
            )
            ->join(
                'user_types as user_type',
                'user_type.id',
                '=',
                'product_role.user_type_id'
            )
            ->leftJoin(
                'subscriptions as subscription',
                function ($join): void {
                    $join
                        ->on(
                            'subscription.id',
                            '=',
                            'access.subscription_id'
                        )
                        ->on(
                            'subscription.product_id',
                            '=',
                            'access.product_id'
                        );
                }
            )
            ->join(
                'users as owner',
                'owner.id',
                '=',
                'access.account_owner_id'
            )
            ->where(
                'access.user_id',
                $userId
            )
            ->where(
                'access.status',
                'active'
            )
            ->where(
                'product.product_code',
                self::PRODUCT_CODE
            )
            ->whereIn(
                'product.status',
                [
                    'development',
                    'active',
                ]
            )
            ->where(
                'product_role.status',
                'active'
            )
            ->where(
                'user_type.status',
                'active'
            )
            ->where(function ($query): void {
                $query
                    ->whereNull(
                        'access.subscription_id'
                    )
                    ->orWhereIn(
                        'subscription.status',
                        [
                            'trial',
                            'active',
                            'past_due',
                            'grace_period',
                            'expired',
                        ]
                    );
            })
            ->orderByDesc(
                'access.id'
            )
            ->select([
                'access.account_owner_id',
                'access.product_id',
                'access.subscription_id',
                'user_type.type_code',
                'user_type.is_owner_type',
                'owner.name as owner_name',
                'owner.email as owner_email',
            ])
            ->first();

        abort_unless(
            $context,
            403,
            'Your account does not have available access to JCM Inventory.'
        );

        abort_unless(
            (bool) $context->is_owner_type,
            403,
            'Only the account owner can manage the business profile.'
        );

        return [
            'user_id' => $userId,

            'account_owner_id' =>
                (int) $context
                    ->account_owner_id,

            'product_id' =>
                (int) $context->product_id,

            'subscription_id' =>
                $context->subscription_id
                    ? (int) $context
                        ->subscription_id
                    : null,

            'role_code' =>
                (string) $context
                    ->type_code,

            'owner_name' =>
                (string) $context
                    ->owner_name,

            'owner_email' =>
                (string) $context
                    ->owner_email,
        ];
    }

    private function resolveBrandAsset(
        Request $request,
        string $fileField,
        string $removeField,
        ?string $currentPath,
        string $disk,
        int $ownerId,
        array &$newFiles,
        array &$oldFilesToDelete,
    ): ?string {
        $file = $request->file($fileField);

        if ($file instanceof UploadedFile) {
            $storedPath = $file->store(
                "business-profiles/{$ownerId}",
                $disk
            );

            $newFiles[] = $storedPath;

            if ($currentPath) {
                $oldFilesToDelete[] =
                    $currentPath;
            }

            return $storedPath;
        }

        if (
            $request->boolean($removeField)
        ) {
            if ($currentPath) {
                $oldFilesToDelete[] =
                    $currentPath;
            }

            return null;
        }

        return $currentPath;
    }

    private function fileUrl(
        string $disk,
        ?string $path
    ): ?string {
        if (
            ! $path
            || ! Storage::disk($disk)
                ->exists($path)
        ) {
            return null;
        }

        return Storage::disk($disk)
            ->url($path);
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

    private function normalizeColor(
        mixed $value
    ): ?string {
        $value =
            $this->nullableString($value);

        return $value
            ? strtoupper($value)
            : null;
    }
}
