<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class OverviewController extends Controller
{
    public function sales(): Response
    {
        $today = Carbon::today();
        $monthStart = Carbon::now()->startOfMonth();
        $trendStart = Carbon::now()->subMonths(11)->startOfMonth();

        $months = collect(range(11, 0))->map(function (int $monthsAgo): array {
            $date = Carbon::now()->subMonths($monthsAgo);

            return [
                'key' => $date->format('Y-m'),
                'label' => $date->format('M Y'),
            ];
        });

        $revenueByMonth = DB::table('transactions')
            ->selectRaw("DATE_FORMAT(COALESCE(verified_at, created_at), '%Y-%m') as month_key")
            ->selectRaw('SUM(amount) as revenue')
            ->selectRaw('COUNT(*) as payments')
            ->where('status', 'verified')
            ->where('created_at', '>=', $trendStart)
            ->groupBy('month_key')
            ->get()
            ->keyBy('month_key');

        $ordersByMonth = DB::table('orders')
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month_key")
            ->selectRaw('COUNT(*) as total_orders')
            ->selectRaw("SUM(CASE WHEN status = 'verified' THEN 1 ELSE 0 END) as verified_orders")
            ->selectRaw("SUM(CASE WHEN status IN ('pending', 'payment_submitted', 'paid') THEN 1 ELSE 0 END) as open_orders")
            ->where('created_at', '>=', $trendStart)
            ->groupBy('month_key')
            ->get()
            ->keyBy('month_key');

        $trend = $months->map(function (array $month) use ($revenueByMonth, $ordersByMonth): array {
            $revenue = $revenueByMonth->get($month['key']);
            $orders = $ordersByMonth->get($month['key']);

            return [
                'label' => $month['label'],
                'revenue' => (float) ($revenue->revenue ?? 0),
                'payments' => (int) ($revenue->payments ?? 0),
                'orders' => (int) ($orders->total_orders ?? 0),
                'verified_orders' => (int) ($orders->verified_orders ?? 0),
                'open_orders' => (int) ($orders->open_orders ?? 0),
            ];
        })->values();

        $revenueByProduct = DB::table('transactions')
            ->join('orders', 'orders.id', '=', 'transactions.order_id')
            ->leftJoin('products', 'products.id', '=', 'orders.product_id')
            ->leftJoin('services', 'services.id', '=', 'orders.service_id')
            ->where('transactions.status', 'verified')
            ->selectRaw("COALESCE(products.name, services.name, 'Unassigned') as label")
            ->selectRaw('SUM(transactions.amount) as revenue')
            ->selectRaw('COUNT(transactions.id) as payments')
            ->groupBy('label')
            ->orderByDesc('revenue')
            ->get()
            ->map(fn (object $row): array => [
                'label' => $row->label,
                'revenue' => (float) $row->revenue,
                'payments' => (int) $row->payments,
            ]);

        $paymentMethods = DB::table('transactions')
            ->join('payment_methods', 'payment_methods.id', '=', 'transactions.payment_method_id')
            ->select('payment_methods.name as label')
            ->selectRaw('COUNT(transactions.id) as payments')
            ->selectRaw('SUM(transactions.amount) as amount')
            ->groupBy('payment_methods.id', 'payment_methods.name')
            ->orderByDesc('amount')
            ->get()
            ->map(fn (object $row): array => [
                'label' => $row->label,
                'payments' => (int) $row->payments,
                'amount' => (float) $row->amount,
            ]);

        $topPlans = DB::table('transactions')
            ->join('orders', 'orders.id', '=', 'transactions.order_id')
            ->leftJoin('plans', 'plans.id', '=', 'orders.plan_id')
            ->leftJoin('products', 'products.id', '=', 'orders.product_id')
            ->where('transactions.status', 'verified')
            ->selectRaw("COALESCE(plans.plan_name, 'Custom Order') as plan_name")
            ->selectRaw("COALESCE(products.name, 'Service') as product_name")
            ->selectRaw('SUM(transactions.amount) as revenue')
            ->selectRaw('COUNT(transactions.id) as sales')
            ->groupBy('plan_name', 'product_name')
            ->orderByDesc('revenue')
            ->limit(8)
            ->get();

        $recentPayments = DB::table('transactions')
            ->join('orders', 'orders.id', '=', 'transactions.order_id')
            ->join('users', 'users.id', '=', 'transactions.user_id')
            ->join('payment_methods', 'payment_methods.id', '=', 'transactions.payment_method_id')
            ->leftJoin('products', 'products.id', '=', 'orders.product_id')
            ->leftJoin('plans', 'plans.id', '=', 'orders.plan_id')
            ->select([
                'transactions.id',
                'transactions.transaction_code',
                'transactions.reference_number',
                'transactions.amount',
                'transactions.status',
                'transactions.created_at',
                'users.name as user_name',
                'payment_methods.name as payment_method',
                'products.name as product_name',
                'plans.plan_name',
                'orders.order_code',
            ])
            ->orderByDesc('transactions.created_at')
            ->limit(12)
            ->get();

        return Inertia::render('admin/overviews/sales', [
            'stats' => [
                'total_revenue' => (float) DB::table('transactions')->where('status', 'verified')->sum('amount'),
                'monthly_revenue' => (float) DB::table('transactions')->where('status', 'verified')->where('created_at', '>=', $monthStart)->sum('amount'),
                'revenue_today' => (float) DB::table('transactions')->where('status', 'verified')->whereDate('created_at', $today)->sum('amount'),
                'pending_amount' => (float) DB::table('transactions')->whereIn('status', ['pending', 'submitted'])->sum('amount'),
                'submitted_payments' => DB::table('transactions')->where('status', 'submitted')->count(),
                'verified_orders' => DB::table('orders')->where('status', 'verified')->count(),
            ],
            'trend' => $trend,
            'revenueByProduct' => $revenueByProduct,
            'paymentMethods' => $paymentMethods,
            'topPlans' => $topPlans,
            'recentPayments' => $recentPayments,
        ]);
    }

    public function users(): Response
    {
        $monthStart = Carbon::now()->startOfMonth();
        $trendStart = Carbon::now()->subMonths(11)->startOfMonth();

        $months = collect(range(11, 0))->map(function (int $monthsAgo): array {
            $date = Carbon::now()->subMonths($monthsAgo);

            return [
                'key' => $date->format('Y-m'),
                'label' => $date->format('M Y'),
            ];
        });

        $monthlyUsers = DB::table('users')
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month_key")
            ->selectRaw('COUNT(*) as total')
            ->where('created_at', '>=', $trendStart)
            ->groupBy('month_key')
            ->pluck('total', 'month_key');

        $trend = $months->map(fn (array $month): array => [
            'label' => $month['label'],
            'users' => (int) ($monthlyUsers->get($month['key']) ?? 0),
        ])->values();

        $activeAdminIds = DB::table('user_platform_roles as upr')
            ->join('platform_roles as pr', 'pr.id', '=', 'upr.platform_role_id')
            ->where('upr.status', 'active')
            ->whereIn('pr.role_code', ['super_admin', 'admin'])
            ->distinct()
            ->pluck('upr.user_id');

        $roleDistribution = DB::table('users')
            ->leftJoin('user_platform_roles as upr', function ($join): void {
                $join->on('upr.user_id', '=', 'users.id')
                    ->where('upr.status', '=', 'active')
                    ->where('upr.is_primary', '=', 1);
            })
            ->leftJoin('platform_roles as pr', 'pr.id', '=', 'upr.platform_role_id')
            ->selectRaw("COALESCE(pr.name, 'Platform User') as label")
            ->selectRaw('COUNT(DISTINCT users.id) as total')
            ->groupBy('label')
            ->orderByDesc('total')
            ->get()
            ->map(fn (object $row): array => ['label' => $row->label, 'total' => (int) $row->total]);

        $accessByProduct = DB::table('user_product_access as access')
            ->join('products', 'products.id', '=', 'access.product_id')
            ->select('products.name as label')
            ->selectRaw('COUNT(DISTINCT access.user_id) as users')
            ->selectRaw("SUM(CASE WHEN access.status = 'active' THEN 1 ELSE 0 END) as active_access")
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('active_access')
            ->get()
            ->map(fn (object $row): array => [
                'label' => $row->label,
                'users' => (int) $row->users,
                'active_access' => (int) $row->active_access,
            ]);

        $recentUsers = DB::table('users')
            ->leftJoin('user_platform_roles as upr', function ($join): void {
                $join->on('upr.user_id', '=', 'users.id')
                    ->where('upr.status', '=', 'active')
                    ->where('upr.is_primary', '=', 1);
            })
            ->leftJoin('platform_roles as pr', 'pr.id', '=', 'upr.platform_role_id')
            ->select([
                'users.id',
                'users.name',
                'users.email',
                'users.is_active',
                'users.email_verified_at',
                'users.created_at',
                DB::raw("COALESCE(pr.name, 'Platform User') as role_name"),
            ])
            ->orderByDesc('users.created_at')
            ->limit(12)
            ->get();

        return Inertia::render('admin/overviews/users', [
            'stats' => [
                'total_users' => DB::table('users')->count(),
                'active_users' => DB::table('users')->where('is_active', 1)->count(),
                'inactive_users' => DB::table('users')->where('is_active', 0)->count(),
                'administrators' => $activeAdminIds->count(),
                'clients' => DB::table('users')->whereNotIn('id', $activeAdminIds)->count(),
                'new_this_month' => DB::table('users')->where('created_at', '>=', $monthStart)->count(),
                'account_owners' => DB::table('user_product_access')->distinct()->count('account_owner_id'),
                'active_product_access' => DB::table('user_product_access')->where('status', 'active')->count(),
            ],
            'trend' => $trend,
            'roleDistribution' => $roleDistribution,
            'accessByProduct' => $accessByProduct,
            'recentUsers' => $recentUsers,
        ]);
    }

    public function subscriptions(): Response
    {
        $today = Carbon::today();
        $nextSevenDays = Carbon::today()->addDays(7);
        $nextThirtyDays = Carbon::today()->addDays(30);

        $statusDistribution = DB::table('subscriptions')
            ->select('status')
            ->selectRaw('COUNT(*) as total')
            ->groupBy('status')
            ->orderByDesc('total')
            ->get()
            ->map(fn (object $row): array => [
                'label' => str($row->status)->replace('_', ' ')->title()->toString(),
                'status' => $row->status,
                'total' => (int) $row->total,
            ]);

        $productDistribution = DB::table('subscriptions')
            ->join('products', 'products.id', '=', 'subscriptions.product_id')
            ->join('plans', 'plans.id', '=', 'subscriptions.plan_id')
            ->select('products.name as product_name', 'plans.plan_name')
            ->selectRaw('COUNT(*) as subscriptions')
            ->selectRaw("SUM(CASE WHEN subscriptions.status IN ('trial', 'active', 'past_due', 'grace_period') THEN 1 ELSE 0 END) as live_subscriptions")
            ->selectRaw('SUM(COALESCE(subscriptions.amount, 0)) as value')
            ->groupBy('products.id', 'products.name', 'plans.id', 'plans.plan_name')
            ->orderByDesc('live_subscriptions')
            ->get();

        $recentSubscriptions = DB::table('subscriptions')
            ->join('users', 'users.id', '=', 'subscriptions.account_owner_id')
            ->join('products', 'products.id', '=', 'subscriptions.product_id')
            ->join('plans', 'plans.id', '=', 'subscriptions.plan_id')
            ->select([
                'subscriptions.id',
                'subscriptions.subscription_code',
                'subscriptions.subscription_type',
                'subscriptions.status',
                'subscriptions.amount',
                'subscriptions.start_date',
                'subscriptions.end_date',
                'subscriptions.current_period_end',
                'subscriptions.updated_at',
                'users.name as owner_name',
                'products.name as product_name',
                'plans.plan_name',
            ])
            ->orderByDesc('subscriptions.updated_at')
            ->limit(12)
            ->get();

        $recentEvents = DB::table('subscription_events as events')
            ->join('subscriptions', 'subscriptions.id', '=', 'events.subscription_id')
            ->join('users as owners', 'owners.id', '=', 'subscriptions.account_owner_id')
            ->leftJoin('users as actors', 'actors.id', '=', 'events.actor_user_id')
            ->leftJoin('products', 'products.id', '=', 'subscriptions.product_id')
            ->select([
                'events.id',
                'events.event_type',
                'events.old_status',
                'events.new_status',
                'events.notes',
                'events.created_at',
                'owners.name as owner_name',
                'actors.name as actor_name',
                'products.name as product_name',
                'subscriptions.subscription_code',
            ])
            ->orderByDesc('events.created_at')
            ->limit(10)
            ->get();

        $estimatedMrr = (float) DB::table('subscriptions')
            ->whereIn('status', ['active', 'past_due', 'grace_period'])
            ->selectRaw("SUM(CASE
                WHEN subscription_type = 'monthly' THEN COALESCE(amount, 0)
                WHEN subscription_type = 'quarterly' THEN COALESCE(amount, 0) / 3
                WHEN subscription_type = 'yearly' THEN COALESCE(amount, 0) / 12
                WHEN subscription_type = 'custom' THEN COALESCE(amount, 0) / GREATEST(duration_days / 30, 1)
                ELSE 0
            END) as mrr")
            ->value('mrr');

        return Inertia::render('admin/overviews/subscriptions', [
            'stats' => [
                'total' => DB::table('subscriptions')->count(),
                'active' => DB::table('subscriptions')->where('status', 'active')->count(),
                'trial' => DB::table('subscriptions')->where('status', 'trial')->count(),
                'attention' => DB::table('subscriptions')->whereIn('status', ['past_due', 'grace_period', 'locked', 'suspended'])->count(),
                'expired' => DB::table('subscriptions')->where('status', 'expired')->count(),
                'expiring_7_days' => DB::table('subscriptions')->whereIn('status', ['active', 'trial'])->whereBetween('end_date', [$today, $nextSevenDays])->count(),
                'expiring_30_days' => DB::table('subscriptions')->whereIn('status', ['active', 'trial'])->whereBetween('end_date', [$today, $nextThirtyDays])->count(),
                'estimated_mrr' => $estimatedMrr,
            ],
            'statusDistribution' => $statusDistribution,
            'productDistribution' => $productDistribution,
            'recentSubscriptions' => $recentSubscriptions,
            'recentEvents' => $recentEvents,
        ]);
    }
}
