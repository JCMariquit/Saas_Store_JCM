<?php

namespace App\Services;

use App\Models\LoginActivity;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Throwable;

class LoginActivityLogger
{
    public const LOGIN_SUCCESS = 'login_success';

    public const LOGIN_FAILED = 'login_failed';

    public const LOGOUT = 'logout';

    /**
     * Login tracking must never interrupt authentication.
     */
    public static function record(
        Request $request,
        string $eventType,
        ?User $user = null,
        ?string $emailAttempted = null,
    ): void {
        try {
            if (! Schema::connection('saas')->hasTable('login_activities')) {
                return;
            }

            $details = self::describeUserAgent($request->userAgent());

            LoginActivity::query()->create([
                'user_id' => $user?->getKey(),
                'email_attempted' => self::normalizeEmail($emailAttempted ?: $user?->email),
                'event_type' => $eventType,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'browser' => $details['browser'],
                'platform' => $details['platform'],
                'device_type' => $details['device_type'],
                'session_id' => $request->hasSession()
                    ? $request->session()->getId()
                    : null,
                'occurred_at' => now(),
            ]);
        } catch (Throwable) {
            // Authentication must continue even when activity logging fails.
        }
    }

    /**
     * Resolve a matching user for failed attempts without exposing whether
     * the submitted email exists.
     */
    public static function matchingUser(?string $email): ?User
    {
        if (! $email) {
            return null;
        }

        try {
            return User::query()
                ->where('email', mb_strtolower(trim($email)))
                ->first();
        } catch (Throwable) {
            return null;
        }
    }

    private static function normalizeEmail(?string $email): ?string
    {
        if (! $email) {
            return null;
        }

        return mb_strtolower(trim($email));
    }

    /**
     * Lightweight user-agent parsing without adding another dependency.
     *
     * @return array{browser: string, platform: string, device_type: string}
     */
    public static function describeUserAgent(?string $userAgent): array
    {
        $agent = mb_strtolower($userAgent ?? '');

        $browser = match (true) {
            str_contains($agent, 'edg/') => 'Microsoft Edge',
            str_contains($agent, 'opr/') || str_contains($agent, 'opera') => 'Opera',
            str_contains($agent, 'firefox/') => 'Firefox',
            str_contains($agent, 'chrome/') => 'Google Chrome',
            str_contains($agent, 'safari/') => 'Safari',
            default => 'Unknown browser',
        };

        $platform = match (true) {
            str_contains($agent, 'windows') => 'Windows',
            str_contains($agent, 'android') => 'Android',
            str_contains($agent, 'iphone') || str_contains($agent, 'ipad') => 'iOS',
            str_contains($agent, 'macintosh') || str_contains($agent, 'mac os') => 'macOS',
            str_contains($agent, 'linux') => 'Linux',
            default => 'Unknown platform',
        };

        $deviceType = match (true) {
            str_contains($agent, 'ipad') || str_contains($agent, 'tablet') => 'Tablet',
            str_contains($agent, 'mobile') || str_contains($agent, 'android') || str_contains($agent, 'iphone') => 'Mobile',
            $agent === '' => 'Unknown device',
            default => 'Desktop',
        };

        return [
            'browser' => $browser,
            'platform' => $platform,
            'device_type' => $deviceType,
        ];
    }
}
