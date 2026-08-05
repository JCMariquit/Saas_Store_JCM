<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function index(): Response
    {
        $today = Carbon::today();
        $startOfMonth = Carbon::now()->startOfMonth();
        $sixMonthStart = Carbon::now()->subMonths(5)->startOfMonth();

        $months = collect(range(5, 0))->map(function (int $monthsAgo): array {
            $date = Carbon::now()->subMonths($monthsAgo);

            return [
                'key' => $date->format('Y-m'),
                'label' => $date->format('M Y'),
            ];
        });

        $monthlyRevenue = DB::table('transactions')
            ->selectRaw("DATE_FORMAT(COALESCE(verified_at, created_at), '%Y-%m') as month_key")
            ->selectRaw('SUM(amount) as total')
            ->where('status', 'verified')
            ->where('created_at', '>=', $sixMonthStart)
            ->groupBy('month_key')
            ->pluck('total', 'month_key');

        $monthlyOrders = DB::table('orders')
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month_key")
            ->selectRaw("SUM(CASE WHEN status IN ('pending', 'payment_submitted', 'paid') THEN 1 ELSE 0 END) as pending_orders")
            ->selectRaw("SUM(CASE WHEN status = 'verified' THEN 1 ELSE 0 END) as verified_orders")
            ->selectRaw("SUM(CASE WHEN status IN ('failed', 'cancelled') THEN 1 ELSE 0 END) as rejected_orders")
            ->selectRaw('COUNT(*) as total_orders')
            ->where('created_at', '>=', $sixMonthStart)
            ->groupBy('month_key')
            ->get()
            ->keyBy('month_key');

        $trend = $months->map(function (array $month) use ($monthlyRevenue, $monthlyOrders): array {
            $orderRow = $monthlyOrders->get($month['key']);

            return [
                'label' => $month['label'],
                'revenue' => (float) ($monthlyRevenue->get($month['key']) ?? 0),
                'pending_orders' => (int) ($orderRow->pending_orders ?? 0),
                'verified_orders' => (int) ($orderRow->verified_orders ?? 0),
                'rejected_orders' => (int) ($orderRow->rejected_orders ?? 0),
                'total_orders' => (int) ($orderRow->total_orders ?? 0),
            ];
        })->values();

        $ordersByStatus = DB::table('orders')
            ->select('status')
            ->selectRaw('COUNT(*) as total')
            ->groupBy('status')
            ->orderBy('status')
            ->get()
            ->map(fn (object $row): array => [
                'label' => str($row->status)->replace('_', ' ')->title()->toString(),
                'value' => (int) $row->total,
            ]);

        $subscriptionsByStatus = DB::table('subscriptions')
            ->select('status')
            ->selectRaw('COUNT(*) as total')
            ->groupBy('status')
            ->orderBy('status')
            ->get()
            ->map(fn (object $row): array => [
                'label' => str($row->status)->replace('_', ' ')->title()->toString(),
                'value' => (int) $row->total,
            ]);

        $salesMix = DB::table('orders')
            ->selectRaw("CASE WHEN product_id IS NOT NULL THEN 'Products' WHEN service_id IS NOT NULL THEN 'Services' ELSE 'Unassigned' END as label")
            ->selectRaw('COUNT(*) as value')
            ->groupBy('label')
            ->orderByDesc('value')
            ->get()
            ->map(fn (object $row): array => [
                'label' => $row->label,
                'value' => (int) $row->value,
            ]);

        $paymentStatusMix = DB::table('transactions')
            ->select('status')
            ->selectRaw('COUNT(*) as value')
            ->groupBy('status')
            ->orderByDesc('value')
            ->get()
            ->map(fn (object $row): array => [
                'label' => str($row->status)->replace('_', ' ')->title()->toString(),
                'value' => (int) $row->value,
            ]);

        $topItems = DB::table('transactions')
            ->leftJoin('orders', 'transactions.order_id', '=', 'orders.id')
            ->leftJoin('products', 'orders.product_id', '=', 'products.id')
            ->leftJoin('services', 'orders.service_id', '=', 'services.id')
            ->selectRaw("COALESCE(products.name, services.name, 'Unassigned Item') as label")
            ->selectRaw('SUM(transactions.amount) as revenue')
            ->selectRaw('COUNT(transactions.id) as sales')
            ->where('transactions.status', 'verified')
            ->groupBy('label')
            ->orderByDesc('revenue')
            ->limit(5)
            ->get()
            ->map(fn (object $row): array => [
                'label' => $row->label,
                'revenue' => (float) $row->revenue,
                'sales' => (int) $row->sales,
            ]);

        $analyticsTable = DB::table('orders')
            ->leftJoin('users', 'orders.account_owner_id', '=', 'users.id')
            ->leftJoin('products', 'orders.product_id', '=', 'products.id')
            ->leftJoin('services', 'orders.service_id', '=', 'services.id')
            ->leftJoin('transactions', function ($join): void {
                $join->on('orders.id', '=', 'transactions.order_id')
                    ->whereRaw('transactions.id = (SELECT MAX(t2.id) FROM transactions t2 WHERE t2.order_id = orders.id)');
            })
            ->select([
                'orders.order_code',
                'orders.status as order_status',
                'orders.amount',
                'orders.created_at',
                'users.name as user_name',
                DB::raw("COALESCE(products.name, services.name, '-') as item_name"),
                DB::raw("COALESCE(transactions.status, 'no payment') as payment_status"),
                DB::raw("COALESCE(transactions.transaction_code, '-') as transaction_code"),
            ])
            ->orderByDesc('orders.created_at')
            ->limit(30)
            ->get();

        $recentOrders = DB::table('orders')
            ->leftJoin('users', 'orders.account_owner_id', '=', 'users.id')
            ->leftJoin('products', 'orders.product_id', '=', 'products.id')
            ->leftJoin('services', 'orders.service_id', '=', 'services.id')
            ->select([
                'orders.id',
                'orders.order_code',
                'orders.amount',
                'orders.status',
                'orders.created_at',
                'users.name as user_name',
                DB::raw("COALESCE(products.name, services.name, '-') as item_name"),
            ])
            ->orderByDesc('orders.created_at')
            ->limit(6)
            ->get();

        $recentTransactions = DB::table('transactions')
            ->leftJoin('users', 'transactions.user_id', '=', 'users.id')
            ->leftJoin('orders', 'transactions.order_id', '=', 'orders.id')
            ->leftJoin('payment_methods', 'transactions.payment_method_id', '=', 'payment_methods.id')
            ->select([
                'transactions.id',
                'transactions.transaction_code',
                'transactions.amount',
                'transactions.status',
                'transactions.created_at',
                'users.name as user_name',
                'orders.order_code',
                DB::raw("COALESCE(payment_methods.name, '-') as payment_method"),
            ])
            ->orderByDesc('transactions.created_at')
            ->limit(6)
            ->get();

        $clientCount = DB::table('users')
            ->whereNotExists(function ($query): void {
                $query->selectRaw('1')
                    ->from('user_platform_roles')
                    ->join('platform_roles', 'platform_roles.id', '=', 'user_platform_roles.platform_role_id')
                    ->whereColumn('user_platform_roles.user_id', 'users.id')
                    ->where('user_platform_roles.status', 'active')
                    ->whereIn('platform_roles.role_code', ['super_admin', 'admin']);
            })
            ->count();

        return Inertia::render('admin/index', [
            'stats' => [
                'total_users' => DB::table('users')->count(),
                'active_users' => DB::table('users')->where('is_active', 1)->count(),
                'clients' => $clientCount,
                'total_products' => DB::table('products')->count(),
                'active_products' => DB::table('products')->whereIn('status', ['active', 'development', 'maintenance'])->count(),
                'total_services' => DB::table('services')->count(),
                'active_services' => DB::table('services')->where('status', 'active')->count(),
                'total_plans' => DB::table('plans')->count(),
                'active_plans' => DB::table('plans')->where('status', 'active')->count(),
                'total_orders' => DB::table('orders')->count(),
                'pending_orders' => DB::table('orders')->whereIn('status', ['pending', 'payment_submitted', 'paid'])->count(),
                'verified_orders' => DB::table('orders')->where('status', 'verified')->count(),
                'orders_today' => DB::table('orders')->whereDate('created_at', $today)->count(),
                'total_revenue' => (float) DB::table('transactions')->where('status', 'verified')->sum('amount'),
                'monthly_revenue' => (float) DB::table('transactions')->where('status', 'verified')->where('created_at', '>=', $startOfMonth)->sum('amount'),
                'pending_payment_amount' => (float) DB::table('transactions')->whereIn('status', ['pending', 'submitted'])->sum('amount'),
                'total_subscriptions' => DB::table('subscriptions')->count(),
                'active_subscriptions' => DB::table('subscriptions')->whereIn('status', ['trial', 'active'])->count(),
                'pending_subscriptions' => DB::table('subscriptions')->where('status', 'pending')->count(),
                'expired_subscriptions' => DB::table('subscriptions')->where('status', 'expired')->count(),
                'submitted_transactions' => DB::table('transactions')->where('status', 'submitted')->count(),
                'unread_messages' => DB::table('messages')->where('sender_type', 'user')->where('is_read', 1)->count(),
                'unread_notifications' => DB::table('notifications')->where('is_read', 1)->count(),
            ],
            'charts' => [
                'trend' => $trend,
                'orders_by_status' => $ordersByStatus,
                'subscriptions_by_status' => $subscriptionsByStatus,
                'sales_mix' => $salesMix,
                'payment_status_mix' => $paymentStatusMix,
                'top_items' => $topItems,
            ],
            'analyticsTable' => $analyticsTable,
            'recentOrders' => $recentOrders,
            'recentTransactions' => $recentTransactions,
        ]);
    }
}
