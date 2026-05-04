<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller
{
    public function index()
    {
        $messages = Message::where('user_id', Auth::id())
            ->orderBy('created_at', 'asc')
            ->get();

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

    public function adminReply(Request $request, User $user)
    {
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

    public function markAsRead(Message $message)
    {
        abort_if($message->receiver_id !== Auth::id(), 403);

        $message->update([
            'is_read' => 0,
            'read_at' => now(),
        ]);

        return response()->json([
            'message' => 'Message marked as read.',
        ]);
    }

    public function readAll()
    {
        Message::where('user_id', Auth::id())
            ->where('receiver_id', Auth::id())
            ->where('sender_type', 'admin')
            ->where('is_read', 1)
            ->update([
                'is_read' => 0,
                'read_at' => now(),
            ]);

        return response()->json([
            'message' => 'All admin messages marked as read.',
        ]);
    }
}