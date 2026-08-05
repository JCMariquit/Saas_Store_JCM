<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\LoginActivity;
use App\Services\LoginActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class LoginActivityController extends Controller
{
    public function index(Request $request): Response
    {
        $event = $request->string('event')->toString();
        $allowedEvents = [
            LoginActivityLogger::LOGIN_SUCCESS,
            LoginActivityLogger::LOGIN_FAILED,
            LoginActivityLogger::LOGOUT,
        ];

        if (! in_array($event, $allowedEvents, true)) {
            $event = '';
        }

        $tableReady = Schema::connection(config('database.default'))->hasTable('login_activities');

        if (! $tableReady) {
            return Inertia::render('settings/login-activity', [
                'activities' => $this->emptyPaginator(),
                'filters' => ['event' => $event],
                'summary' => [
                    'total' => 0,
                    'successful' => 0,
                    'failed' => 0,
                    'logouts' => 0,
                ],
                'currentSessionId' => $request->session()->getId(),
                'tableReady' => false,
            ]);
        }

        $baseQuery = LoginActivity::query()
            ->where('user_id', $request->user()->getKey());

        $summary = [
            'total' => (clone $baseQuery)->count(),
            'successful' => (clone $baseQuery)
                ->where('event_type', LoginActivityLogger::LOGIN_SUCCESS)
                ->count(),
            'failed' => (clone $baseQuery)
                ->where('event_type', LoginActivityLogger::LOGIN_FAILED)
                ->count(),
            'logouts' => (clone $baseQuery)
                ->where('event_type', LoginActivityLogger::LOGOUT)
                ->count(),
        ];

        $activities = $baseQuery
            ->when($event !== '', fn ($query) => $query->where('event_type', $event))
            ->orderByDesc('occurred_at')
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (LoginActivity $activity) => [
                'id' => $activity->id,
                'event_type' => $activity->event_type,
                'ip_address' => $activity->ip_address,
                'browser' => $activity->browser,
                'platform' => $activity->platform,
                'device_type' => $activity->device_type,
                'session_id' => $activity->session_id,
                'occurred_at' => $activity->occurred_at?->toIso8601String(),
            ]);

        return Inertia::render('settings/login-activity', [
            'activities' => $activities,
            'filters' => ['event' => $event],
            'summary' => $summary,
            'currentSessionId' => $request->session()->getId(),
            'tableReady' => true,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function emptyPaginator(): array
    {
        return [
            'data' => [],
            'current_page' => 1,
            'last_page' => 1,
            'from' => null,
            'to' => null,
            'total' => 0,
            'links' => [],
        ];
    }
}
