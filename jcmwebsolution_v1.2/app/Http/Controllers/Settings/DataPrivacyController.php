<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\LoginActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DataPrivacyController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $connection = DB::connection();

        $accessCount = $connection
            ->table('user_product_access')
            ->where('user_id', $user->getKey())
            ->count();

        $scopeCount = $connection
            ->table('user_product_access_scopes as scopes')
            ->join('user_product_access as access', 'access.id', '=', 'scopes.access_id')
            ->where('access.user_id', $user->getKey())
            ->count();

        $loginActivityCount = Schema::connection(config('database.default'))->hasTable('login_activities')
            ? LoginActivity::query()->where('user_id', $user->getKey())->count()
            : 0;

        return Inertia::render('settings/data-privacy', [
            'account' => [
                'name' => $user->name,
                'email' => $user->email,
                'email_verified' => $user->email_verified_at !== null,
                'created_at' => $user->created_at?->toIso8601String(),
                'updated_at' => $user->updated_at?->toIso8601String(),
            ],
            'summary' => [
                'product_accesses' => $accessCount,
                'access_scopes' => $scopeCount,
                'login_activities' => $loginActivityCount,
            ],
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $user = $request->user();
        $connection = DB::connection();

        $accesses = $connection
            ->table('user_product_access as access')
            ->join('products', 'products.id', '=', 'access.product_id')
            ->join('product_user_types', 'product_user_types.id', '=', 'access.product_user_type_id')
            ->join('user_types', 'user_types.id', '=', 'product_user_types.user_type_id')
            ->leftJoin('users as owner', 'owner.id', '=', 'access.account_owner_id')
            ->where('access.user_id', $user->getKey())
            ->orderBy('products.name')
            ->get([
                'access.id',
                'products.product_code',
                'products.name as product_name',
                'user_types.type_code as user_type',
                'product_user_types.display_name as role_name',
                'owner.name as account_owner_name',
                'access.status',
                'access.joined_at',
                'access.last_accessed_at',
                'access.created_at',
                'access.updated_at',
            ]);

        $scopes = $connection
            ->table('user_product_access_scopes as scopes')
            ->join('user_product_access as access', 'access.id', '=', 'scopes.access_id')
            ->where('access.user_id', $user->getKey())
            ->orderBy('scopes.access_id')
            ->orderBy('scopes.scope_type')
            ->get([
                'scopes.access_id',
                'scopes.scope_type',
                'scopes.scope_id',
                'scopes.is_primary',
                'scopes.status',
                'scopes.created_at',
                'scopes.updated_at',
            ]);

        $preferences = $connection
            ->table('user_product_preferences')
            ->where('user_id', $user->getKey())
            ->first([
                'default_access_id',
                'last_access_id',
                'landing_behavior',
                'created_at',
                'updated_at',
            ]);

        $activities = Schema::connection(config('database.default'))->hasTable('login_activities')
            ? LoginActivity::query()
                ->where('user_id', $user->getKey())
                ->orderByDesc('occurred_at')
                ->get([
                    'event_type',
                    'ip_address',
                    'browser',
                    'platform',
                    'device_type',
                    'occurred_at',
                ])
            : collect();

        $payload = [
            'export' => [
                'generated_at' => now()->toIso8601String(),
                'application' => config('app.name'),
                'scope' => 'Authenticated account data only',
                'excluded' => [
                    'password hashes',
                    'remember tokens',
                    'two-factor secrets and recovery codes',
                    'session payloads',
                ],
            ],
            'account' => [
                'id' => $user->getKey(),
                'name' => $user->name,
                'email' => $user->email,
                'email_verified_at' => $user->email_verified_at?->toIso8601String(),
                'is_active' => (bool) $user->is_active,
                'created_at' => $user->created_at?->toIso8601String(),
                'updated_at' => $user->updated_at?->toIso8601String(),
            ],
            'product_accesses' => $accesses,
            'access_scopes' => $scopes,
            'product_preferences' => $preferences,
            'login_activity' => $activities,
        ];

        $filename = sprintf(
            'jcm-platform-account-data-%s.json',
            now()->format('Y-m-d-His'),
        );

        return response()->streamDownload(
            static function () use ($payload): void {
                echo json_encode(
                    $payload,
                    JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE,
                );
            },
            $filename,
            ['Content-Type' => 'application/json; charset=UTF-8'],
        );
    }
}
