<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index()
    {
        $notifications = Notification::where('user_id', Auth::id())
            ->latest()
            ->get();

        return response()->json([
            'notifications' => $notifications,
        ]);
    }

    public function show(Notification $notification)
    {
        abort_if($notification->user_id !== Auth::id(), 403);

        $notification->update([
            'is_read' => 0,
            'read_at' => now(),
        ]);

        return response()->json([
            'notification' => $notification,
        ]);
    }

    public function markAsRead(Notification $notification)
    {
        abort_if($notification->user_id !== Auth::id(), 403);

        $notification->update([
            'is_read' => 0,
            'read_at' => now(),
        ]);

        return response()->json([
            'message' => 'Notification marked as read.',
        ]);
    }

    public function markAllAsRead()
    {
        Notification::where('user_id', Auth::id())
            ->where('is_read', 1)
            ->update([
                'is_read' => 0,
                'read_at' => now(),
            ]);

        return response()->json([
            'message' => 'All notifications marked as read.',
        ]);
    }
}