<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use App\Models\User;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;


class SubscriptionController extends Controller
{
    public function index(Request $request)
    {
        $search = trim((string) $request->query('search', ''));

        $subscriptions = Subscription::with(['user', 'product'])
            ->when($search !== '', function ($query) use ($search) {
                $query->whereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn ($sub) => [
                'id' => $sub->id,
                'code' => $sub->subscription_code,
                'user' => $sub->user->name,
                'product' => $sub->product->name,
                'type' => $sub->subscription_type,
                'status' => $sub->status,
                'start_date' => $sub->start_date,
                'end_date' => $sub->end_date,
            ]);

        return Inertia::render('subscriptions/index', [
            'subscriptions' => $subscriptions,
            'filters' => [
                'search' => $search,
            ],
            'users' => User::select('id', 'name')->get(),
            'products' => Product::select('id', 'name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'product_id' => ['required', 'exists:products,id'],
            'subscription_type' => ['required', 'in:trial,monthly,yearly,custom'],
            'duration_days' => ['required', 'integer', 'min:1'],
        ]);

        $start = now();
        $durationDays = (int) $data['duration_days'];
        $end = now()->addDays($durationDays);

        Subscription::create([
            'user_id' => $data['user_id'],
            'product_id' => $data['product_id'],
            'subscription_code' => 'SUB-' . strtoupper(\Illuminate\Support\Str::random(6)),
            'subscription_type' => $data['subscription_type'],
            'status' => 'pending',
            'start_date' => $start->toDateString(),
            'end_date' => $end->toDateString(),
            'duration_days' => $durationDays,
        ]);

        return back()->with('success', 'Subscription created.');
    }

    public function verify(Subscription $subscription)
    {
        $subscription->update([
            'status' => 'active',
            'verified_at' => now(),
        ]);

        return back()->with('success', 'Subscription verified.');
    }

    public function destroy(Subscription $subscription)
    {
        $subscription->delete();

        return back()->with('success', 'Subscription deleted.');
    }
}