<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller
{
    public function adminThreads(Request $request): JsonResponse
    {
        $perPage = 15;
        $userIds = Message::query()->distinct()->pluck('user_id');

        $threads = User::query()
            ->whereIn('id', $userIds)
            ->get(['id', 'name', 'email'])
            ->map(function (User $user): array {
                $lastMessage = Message::query()->where('user_id', $user->id)->latest()->first();
                $unread = Message::query()
                    ->where('user_id', $user->id)
                    ->where('sender_type', 'user')
                    ->where('is_read', 1)
                    ->count();

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar' => null,
                    'last_message' => $lastMessage?->message,
                    'last_message_at' => $lastMessage?->created_at,
                    'unread_count' => $unread,
                ];
            })
            ->sortByDesc('last_message_at')
            ->values();

        $page = max(1, (int) $request->integer('page', 1));

        return response()->json([
            'threads' => $threads->forPage($page, $perPage)->values(),
            'current_page' => $page,
            'per_page' => $perPage,
            'has_more' => $threads->count() > ($page * $perPage),
        ]);
    }

    public function adminConversation(User $user): JsonResponse
    {
        $messages = Message::query()
            ->where('user_id', $user->id)
            ->oldest()
            ->get();

        Message::query()
            ->where('user_id', $user->id)
            ->where('sender_type', 'user')
            ->where('is_read', 1)
            ->update(['is_read' => 0, 'read_at' => now()]);

        return response()->json([
            'user' => $user->only(['id', 'name', 'email']),
            'messages' => $messages,
        ]);
    }

    public function adminReply(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:5000'],
        ]);

        $message = Message::create([
            'user_id' => $user->id,
            'sender_id' => Auth::id(),
            'receiver_id' => $user->id,
            'message' => $validated['message'],
            'sender_type' => 'admin',
            'is_read' => 1,
        ]);

        return response()->json([
            'message' => 'Reply sent successfully.',
            'data' => $message,
        ]);
    }
}
