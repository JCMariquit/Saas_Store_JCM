<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class SystemsController extends Controller
{
    public function index(Request $request): Response
    {
        $systems = DB::table('products')
            ->leftJoin('plans', 'plans.product_id', '=', 'products.id')
            ->leftJoin('subscriptions', 'subscriptions.product_id', '=', 'products.id')
            ->leftJoin('user_product_access', 'user_product_access.product_id', '=', 'products.id')
            ->select([
                'products.id', 'products.product_code', 'products.slug', 'products.name',
                'products.description', 'products.app_url', 'products.status', 'products.sort_order',
            ])
            ->selectRaw('COUNT(DISTINCT plans.id) as plans_count')
            ->selectRaw("COUNT(DISTINCT CASE WHEN subscriptions.status IN ('trial','active','past_due','grace_period') THEN subscriptions.id END) as live_subscriptions")
            ->selectRaw("COUNT(DISTINCT CASE WHEN user_product_access.status = 'active' THEN user_product_access.id END) as active_access")
            ->groupBy('products.id', 'products.product_code', 'products.slug', 'products.name', 'products.description', 'products.app_url', 'products.status', 'products.sort_order')
            ->orderBy('products.sort_order')
            ->orderBy('products.name')
            ->get();

        return Inertia::render('admin/systems/index', [
            'systems' => $systems,
            'stats' => [
                'systems' => DB::table('products')->count(),
                'active_systems' => DB::table('products')->where('status', 'active')->count(),
                'accounts' => DB::table('user_product_access')->where('status', 'active')->distinct('account_owner_id')->count('account_owner_id'),
                'live_subscriptions' => DB::table('subscriptions')->whereIn('status', ['trial', 'active', 'past_due', 'grace_period'])->count(),
                'provisioned' => Schema::hasTable('system_provisioning_logs') ? DB::table('system_provisioning_logs')->where('status', 'completed')->count() : 0,
            ],
        ]);
    }
}
