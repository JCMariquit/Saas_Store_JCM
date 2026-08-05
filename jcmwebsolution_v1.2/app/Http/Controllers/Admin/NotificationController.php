<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function adminIndex(): JsonResponse
    {
        $notifications = Notification::query()
            ->with('user:id,name,email')
            ->selectRaw('MIN(id) as id, MIN(user_id) as user_id, title, message, type, MAX(is_read) as is_read, MIN(created_at) as created_at')
            ->groupBy('title', 'message', 'type')
            ->orderByDesc('created_at')
            ->paginate(15);

        return response()->json([
            'notifications' => $notifications->items(),
            'current_page' => $notifications->currentPage(),
            'per_page' => $notifications->perPage(),
            'has_more' => $notifications->hasMorePages(),
        ]);
    }

    public function adminShow(Notification $notification): JsonResponse
    {
        return response()->json([
            'notification' => $notification->load('user:id,name,email'),
        ]);
    }

    public function adminSend(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'mode' => ['required', 'in:all,single'],
            'user_id' => ['nullable', 'required_if:mode,single', 'exists:users,id'],
            'title' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:5000'],
            'type' => ['nullable', 'string', 'max:100'],
        ]);

        $targetIds = $validated['mode'] === 'single'
            ? collect([(int) $validated['user_id']])
            : User::query()
                ->whereDoesntHave('platformRoles', function ($query): void {
                    $query->whereIn('role_code', ['super_admin', 'admin']);
                })
                ->pluck('id');

        $now = now();
        $rows = $targetIds->map(fn (int $userId): array => [
            'user_id' => $userId,
            'title' => $validated['title'],
            'message' => $validated['message'],
            'type' => $validated['type'] ?? 'announcement',
            'is_read' => 1,
            'created_at' => $now,
            'updated_at' => $now,
        ])->all();

        if ($rows !== []) {
            Notification::query()->insert($rows);
        }

        return response()->json([
            'message' => 'Notification sent successfully.',
            'recipient_count' => count($rows),
        ]);
    }
}
