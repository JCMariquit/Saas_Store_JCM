<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\User;
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

    public function adminIndex(Request $request)
    {
        abort_if(Auth::user()->role !== 'admin', 403);

        $perPage = 15;

        $notifications = Notification::query()
            ->with('user:id,name,email')
            ->selectRaw('
                MIN(id) as id,
                MIN(user_id) as user_id,
                title,
                message,
                type,
                MAX(is_read) as is_read,
                MIN(created_at) as created_at
            ')
            ->groupBy('title', 'message', 'type')
            ->orderByDesc('created_at')
            ->paginate($perPage);

        return response()->json([
            'notifications' => $notifications->items(),
            'current_page' => $notifications->currentPage(),
            'per_page' => $notifications->perPage(),
            'has_more' => $notifications->hasMorePages(),
        ]);
    }

    public function adminShow(Notification $notification)
    {
        abort_if(Auth::user()->role !== 'admin', 403);

        return response()->json([
            'notification' => $notification->load('user:id,name,email'),
        ]);
    }

    public function adminSend(Request $request)
    {
        abort_if(Auth::user()->role !== 'admin', 403);

        $request->validate([
            'mode' => ['required', 'in:all,single'],
            'user_id' => ['nullable', 'exists:users,id'],
            'title' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string'],
            'type' => ['nullable', 'string', 'max:100'],
        ]);

        if ($request->mode === 'single') {
            Notification::create([
                'user_id' => $request->user_id,
                'title' => $request->title,
                'message' => $request->message,
                'type' => $request->type ?? 'announcement',
                'is_read' => 1,
            ]);
        }

        if ($request->mode === 'all') {
            $users = User::where('role', '!=', 'admin')
                ->select('id')
                ->get();

            foreach ($users as $user) {
                Notification::create([
                    'user_id' => $user->id,
                    'title' => $request->title,
                    'message' => $request->message,
                    'type' => $request->type ?? 'announcement',
                    'is_read' => 1,
                ]);
            }
        }

        return response()->json([
            'message' => 'Notification sent successfully.',
        ]);
    }
}