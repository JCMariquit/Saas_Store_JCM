<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        $subscriptions = Subscription::with(['user', 'product', 'plan', 'order'])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('subscription_code', 'like', "%{$search}%")
                        ->orWhere('subscription_type', 'like', "%{$search}%")
                        ->orWhere('status', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($subQ) use ($search) {
                            $subQ->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        })
                        ->orWhereHas('product', function ($subQ) use ($search) {
                            $subQ->where('name', 'like', "%{$search}%");
                        })
                        ->orWhereHas('plan', function ($subQ) use ($search) {
                            $subQ->where('plan_name', 'like', "%{$search}%");
                        })
                        ->orWhereHas('order', function ($subQ) use ($search) {
                            $subQ->where('order_code', 'like', "%{$search}%");
                        });
                });
            })
            ->latest('id')
            ->paginate(10)
            ->withQueryString()
            ->through(function ($sub) {
                return [
                    'id' => $sub->id,
                    'subscription_code' => $sub->subscription_code,
                    'order_code' => $sub->order?->order_code,
                    'user_name' => $sub->user?->name,
                    'product_name' => $sub->product?->name,
                    'plan_name' => $sub->plan?->plan_name,
                    'subscription_type' => $sub->subscription_type,
                    'status' => $sub->status,
                    'start_date' => optional($sub->start_date)?->format('Y-m-d'),
                    'end_date' => optional($sub->end_date)?->format('Y-m-d'),
                    'duration_days' => $sub->duration_days,
                    'amount' => $sub->amount,
                    'notes' => $sub->notes,
                ];
            });

        return Inertia::render('subscriptions/index', [
            'subscriptions' => $subscriptions,
            'filters' => [
                'search' => $search,
            ],
            'stats' => [
                'total_subscriptions' => Subscription::count(),
                'active_subscriptions' => Subscription::where('status', 'active')->count(),
                'pending_subscriptions' => Subscription::where('status', 'pending')->count(),
                'expired_subscriptions' => Subscription::where('status', 'expired')->count(),
            ],
        ]);
    }

    public function destroy(Subscription $subscription): RedirectResponse
    {
        if ($subscription->status === 'active') {
            return back()->with('success', 'Active subscription cannot be deleted directly.');
        }

        $subscription->delete();

        return back()->with('success', 'Subscription deleted successfully.');
    }

    public function cancel(Request $request, Subscription $subscription): RedirectResponse
    {
        $validated = $request->validate([
            'notes' => ['nullable', 'string'],
        ]);

        $subscription->update([
            'status' => 'cancelled',
            'notes' => $validated['notes'] ?? $subscription->notes,
        ]);

        return back()->with('success', 'Subscription cancelled successfully.');
    }

    public function lock(Request $request, Subscription $subscription): RedirectResponse
    {
        $validated = $request->validate([
            'notes' => ['nullable', 'string'],
        ]);

        $subscription->update([
            'status' => 'locked',
            'notes' => $validated['notes'] ?? $subscription->notes,
        ]);

        return back()->with('success', 'Subscription locked successfully.');
    }
}