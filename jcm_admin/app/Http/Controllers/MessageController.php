<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class MessageController extends Controller
{
    public function index()
    {
        $messages = Message::where('user_id', Auth::id())
            ->orderBy('created_at', 'asc')
            ->get();

        Message::where('user_id', Auth::id())
            ->where('sender_type', 'admin')
            ->where('is_read', 1)
            ->update([
                'is_read' => 0,
                'read_at' => now(),
            ]);

        return response()->json([
            'messages' => $messages,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'message' => ['required', 'string'],
        ]);

        $admin = User::where('role', 'admin')->first();

        if (!$admin) {
            return response()->json([
                'message' => 'No admin account found.',
            ], 404);
        }

        $message = Message::create([
            'user_id' => Auth::id(),
            'sender_id' => Auth::id(),
            'receiver_id' => $admin->id,
            'message' => $request->message,
            'sender_type' => 'user',
            'is_read' => 1,
        ]);

        return response()->json([
            'message' => 'Message sent successfully.',
            'data' => $message,
        ]);
    }

    /**
     * 🔥 FIXED THREAD LIST (ITO YUNG PROBLEM MO)
     */
public function adminThreads(Request $request)
{
    abort_if(Auth::user()->role !== 'admin', 403);

    $perPage = 15;

    $userIds = Message::select('user_id')
        ->distinct()
        ->pluck('user_id');

    $threads = User::whereIn('id', $userIds)
        ->get()
        ->map(function ($user) {
            $lastMessage = Message::where('user_id', $user->id)
                ->latest()
                ->first();

            $unread = Message::where('user_id', $user->id)
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

    $page = (int) $request->get('page', 1);
    $paginated = $threads->forPage($page, $perPage)->values();

    return response()->json([
        'threads' => $paginated,
        'current_page' => $page,
        'per_page' => $perPage,
        'has_more' => $threads->count() > ($page * $perPage),
    ]);
}
    public function adminConversation(User $user)
    {
        abort_if(Auth::user()->role !== 'admin', 403);

        $messages = Message::where('user_id', $user->id)
            ->orderBy('created_at', 'asc')
            ->get();

        Message::where('user_id', $user->id)
            ->where('sender_type', 'user')
            ->where('is_read', 1)
            ->update([
                'is_read' => 0,
                'read_at' => now(),
            ]);

        return response()->json([
            'user' => $user,
            'messages' => $messages,
        ]);
    }

    public function adminReply(Request $request, User $user)
    {
        abort_if(Auth::user()->role !== 'admin', 403);

        $request->validate([
            'message' => ['required', 'string'],
        ]);

        $message = Message::create([
            'user_id' => $user->id,
            'sender_id' => Auth::id(),
            'receiver_id' => $user->id,
            'message' => $request->message,
            'sender_type' => 'admin',
            'is_read' => 1,
        ]);

        return response()->json([
            'message' => 'Reply sent successfully.',
            'data' => $message,
        ]);
    }
}