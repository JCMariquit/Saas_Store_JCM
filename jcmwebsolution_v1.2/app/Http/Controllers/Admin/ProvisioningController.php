<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\SystemProvisioningService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProvisioningController extends Controller
{
    public function index(): Response
    {
        $products = DB::table('products')
            ->whereIn('status', ['development', 'active'])
            ->orderBy('sort_order')
            ->get(['id', 'product_code', 'name', 'status']);

        $plans = DB::table('plans')
            ->where('status', 'active')
            ->orderBy('product_id')
            ->orderBy('sort_order')
            ->get(['id', 'product_id', 'plan_code', 'plan_name', 'price', 'billing_interval', 'duration_days', 'trial_days']);

        $users = DB::table('users')
            ->where('is_active', true)
            ->whereNotIn('id', function ($query): void {
                $query->select('user_id')->from('user_platform_roles')
                    ->join('platform_roles', 'platform_roles.id', '=', 'user_platform_roles.platform_role_id')
                    ->where('user_platform_roles.status', 'active')
                    ->whereIn('platform_roles.role_code', ['super_admin', 'admin']);
            })
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        $logs = Schema::hasTable('system_provisioning_logs')
            ? DB::table('system_provisioning_logs as logs')
                ->leftJoin('users as owners', 'owners.id', '=', 'logs.account_owner_id')
                ->leftJoin('products', 'products.id', '=', 'logs.product_id')
                ->leftJoin('plans', 'plans.id', '=', 'logs.plan_id')
                ->select('logs.*', 'owners.name as owner_name', 'owners.email as owner_email', 'products.name as product_name', 'plans.plan_name')
                ->orderByDesc('logs.id')->limit(12)->get()
            : collect();

        return Inertia::render('admin/systems/provision', compact('products', 'plans', 'users', 'logs'));
    }

    public function store(Request $request, SystemProvisioningService $service): RedirectResponse
    {
        $usingExisting = $request->filled('existing_user_id');
        $validated = $request->validate([
            'existing_user_id' => ['nullable', 'integer', 'exists:users,id'],
            'name' => [Rule::requiredIf(! $usingExisting), 'nullable', 'string', 'max:255'],
            'email' => [Rule::requiredIf(! $usingExisting), 'nullable', 'email', 'max:255', 'unique:users,email'],
            'password' => [Rule::requiredIf(! $usingExisting), 'nullable', 'string', 'min:8', 'confirmed'],
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'plan_id' => ['required', 'integer', 'exists:plans,id'],
            'billing_interval' => ['nullable', Rule::in(['monthly', 'quarterly', 'yearly', 'custom'])],
            'subscription_status' => ['required', Rule::in(['pending', 'trial', 'active'])],
            'business_name' => ['required', 'string', 'max:180'],
            'business_category' => ['nullable', 'string', 'max:120'],
            'contact_email' => ['nullable', 'email', 'max:180'],
            'contact_phone' => ['nullable', 'string', 'max:50'],
            'address_line' => ['nullable', 'string', 'max:255'],
            'branch_name' => ['nullable', 'string', 'max:180'],
            'warehouse_name' => ['nullable', 'string', 'max:180'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $service->provision($request, $validated);

        return to_route('admin.systems.provision')->with('success', 'System account provisioned successfully.');
    }
}
