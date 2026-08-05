<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\PlatformAuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionPolicyController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/subscription-policies/index', [
            'products' => DB::table('products')->leftJoin('product_subscription_policies as policies', 'policies.product_id', '=', 'products.id')
                ->select('products.id', 'products.name', 'products.product_code', 'products.status as product_status',
                    'policies.default_trial_days', 'policies.grace_period_days', 'policies.past_due_access_mode',
                    'policies.expired_access_mode', 'policies.allow_manual_payment', 'policies.allow_auto_renew',
                    'policies.lock_after_expiry_days', 'policies.status')
                ->orderBy('products.sort_order')->get(),
        ]);
    }

    public function update(Request $request, int $product, PlatformAuditLogger $audit): RedirectResponse
    {
        abort_unless(DB::table('products')->where('id', $product)->exists(), 404);
        $validated = $request->validate([
            'default_trial_days' => ['required', 'integer', 'min:0', 'max:365'],
            'grace_period_days' => ['required', 'integer', 'min:0', 'max:365'],
            'past_due_access_mode' => ['required', Rule::in(['blocked', 'read_only'])],
            'expired_access_mode' => ['required', Rule::in(['blocked', 'read_only'])],
            'allow_manual_payment' => ['required', 'boolean'], 'allow_auto_renew' => ['required', 'boolean'],
            'lock_after_expiry_days' => ['nullable', 'integer', 'min:0', 'max:3650'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ]);
        $old = DB::table('product_subscription_policies')->where('product_id', $product)->first();
        DB::table('product_subscription_policies')->updateOrInsert(['product_id' => $product], $validated + ['created_at' => now(), 'updated_at' => now()]);
        $audit->write($request, 'subscription_policies', 'updated', 'Updated subscription policy.', 'product', $product, $old, $validated);
        return back()->with('success', 'Subscription policy updated successfully.');
    }
}
