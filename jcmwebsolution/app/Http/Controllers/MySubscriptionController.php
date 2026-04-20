<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class MySubscriptionController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();

        $subscriptions = Subscription::query()
            ->with([
                'product:id,name,description',
                'plan:id,plan_name,price,duration_days',
                'order:id,order_code',
            ])
            ->where('user_id', $user->id)
            ->orderByRaw("
                CASE status
                    WHEN 'active' THEN 1
                    WHEN 'pending' THEN 2
                    WHEN 'locked' THEN 3
                    WHEN 'expired' THEN 4
                    WHEN 'cancelled' THEN 5
                    ELSE 6
                END
            ")
            ->latest('id')
            ->get()
            ->map(function ($subscription) {
                $daysLeft = null;

                if ($subscription->end_date) {
                    $daysLeft = Carbon::now()->startOfDay()->diffInDays(
                        Carbon::parse($subscription->end_date)->startOfDay(),
                        false
                    );
                }

                return [
                    'id' => $subscription->id,
                    'subscription_code' => $subscription->subscription_code,
                    'subscription_type' => $subscription->subscription_type,
                    'status' => $subscription->status,
                    'start_date' => optional($subscription->start_date)->format('M d, Y'),
                    'end_date' => optional($subscription->end_date)->format('M d, Y'),
                    'duration_days' => $subscription->duration_days,
                    'amount' => $subscription->amount,
                    'notes' => $subscription->notes,
                    'days_left' => $daysLeft,
                    'product' => [
                        'name' => $subscription->product?->name,
                        'description' => $subscription->product?->description,
                    ],
                    'plan' => [
                        'name' => $subscription->plan?->plan_name,
                        'price' => $subscription->plan?->price,
                        'duration_days' => $subscription->plan?->duration_days,
                    ],
                    'order' => [
                        'code' => $subscription->order?->order_code,
                    ],
                ];
            })
            ->values();

        return Inertia::render('my-subscription', [
            'subscriptions' => $subscriptions,
            'stats' => [
                'total_subscriptions' => $subscriptions->count(),
                'active_subscriptions' => $subscriptions->where('status', 'active')->count(),
                'expiring_soon' => $subscriptions->filter(function ($subscription) {
                    return $subscription['status'] === 'active'
                        && $subscription['days_left'] !== null
                        && $subscription['days_left'] <= 7;
                })->count(),
                'expired_subscriptions' => $subscriptions->where('status', 'expired')->count(),
            ],
        ]);
    }
}