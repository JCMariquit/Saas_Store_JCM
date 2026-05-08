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

        $lastSixMonths = collect(range(5, 0))->map(function ($monthsAgo) {
            $date = Carbon::now()->subMonths($monthsAgo);

            return [
                'key' => $date->format('Y-m'),
                'label' => $date->format('M Y'),
            ];
        });

        $monthlyRevenueRaw = DB::table('transactions')
            ->selectRaw("DATE_FORMAT(COALESCE(verified_at, created_at), '%Y-%m') as month_key")
            ->selectRaw('SUM(amount) as total')
            ->where('status', 'verified')
            ->where('created_at', '>=', Carbon::now()->subMonths(6)->startOfMonth())
            ->groupBy('month_key')
            ->pluck('total', 'month_key');

        $monthlyOrdersRaw = DB::table('orders')
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month_key")
            ->selectRaw("SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders")
            ->selectRaw("SUM(CASE WHEN status = 'verified' THEN 1 ELSE 0 END) as verified_orders")
            ->selectRaw("SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_orders")
            ->selectRaw('COUNT(*) as total_orders')
            ->where('created_at', '>=', Carbon::now()->subMonths(6)->startOfMonth())
            ->groupBy('month_key')
            ->get()
            ->keyBy('month_key');

        $trend = $lastSixMonths->map(function ($month) use ($monthlyRevenueRaw, $monthlyOrdersRaw) {
            $orderRow = $monthlyOrdersRaw[$month['key']] ?? null;

            return [
                'label' => $month['label'],
                'revenue' => (float) ($monthlyRevenueRaw[$month['key']] ?? 0),
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
            ->map(fn ($row) => [
                'label' => ucfirst($row->status),
                'value' => (int) $row->total,
            ]);

        $subscriptionsByStatus = DB::table('subscriptions')
            ->select('status')
            ->selectRaw('COUNT(*) as total')
            ->groupBy('status')
            ->orderBy('status')
            ->get()
            ->map(fn ($row) => [
                'label' => ucfirst($row->status),
                'value' => (int) $row->total,
            ]);

        $salesMix = DB::table('orders')
            ->selectRaw("
                CASE
                    WHEN product_id IS NOT NULL THEN 'Products'
                    WHEN service_id IS NOT NULL THEN 'Services'
                    ELSE 'Unassigned'
                END as label
            ")
            ->selectRaw('COUNT(*) as value')
            ->groupBy('label')
            ->orderByDesc('value')
            ->get()
            ->map(fn ($row) => [
                'label' => $row->label,
                'value' => (int) $row->value,
            ]);

        $paymentStatusMix = DB::table('transactions')
            ->select('status')
            ->selectRaw('COUNT(*) as value')
            ->groupBy('status')
            ->orderByDesc('value')
            ->get()
            ->map(fn ($row) => [
                'label' => ucfirst($row->status),
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
            ->map(fn ($row) => [
                'label' => $row->label,
                'revenue' => (float) $row->revenue,
                'sales' => (int) $row->sales,
            ]);

        $analyticsTable = DB::table('orders')
            ->leftJoin('users', 'orders.user_id', '=', 'users.id')
            ->leftJoin('products', 'orders.product_id', '=', 'products.id')
            ->leftJoin('services', 'orders.service_id', '=', 'services.id')
            ->leftJoin('transactions', 'orders.id', '=', 'transactions.order_id')
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
            ->leftJoin('users', 'orders.user_id', '=', 'users.id')
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
            ->select([
                'transactions.id',
                'transactions.transaction_code',
                'transactions.amount',
                'transactions.status',
                'transactions.payment_method',
                'transactions.created_at',
                'users.name as user_name',
                'orders.order_code',
            ])
            ->orderByDesc('transactions.created_at')
            ->limit(6)
            ->get();

        return Inertia::render('admin/index', [
            'stats' => [
                'total_users' => DB::table('users')->count(),
                'active_users' => DB::table('users')->where('is_active', 1)->count(),
                'clients' => DB::table('users')->where('role', 'client')->count(),

                'total_products' => DB::table('products')->count(),
                'active_products' => DB::table('products')->where('status', 'active')->count(),

                'total_services' => DB::table('services')->count(),
                'active_services' => DB::table('services')->where('status', 'active')->count(),

                'total_plans' => DB::table('plans')->count(),
                'active_plans' => DB::table('plans')->where('status', 'active')->count(),

                'total_orders' => DB::table('orders')->count(),
                'pending_orders' => DB::table('orders')->where('status', 'pending')->count(),
                'verified_orders' => DB::table('orders')->where('status', 'verified')->count(),
                'orders_today' => DB::table('orders')->whereDate('created_at', $today)->count(),

                'total_revenue' => (float) DB::table('transactions')->where('status', 'verified')->sum('amount'),
                'monthly_revenue' => (float) DB::table('transactions')
                    ->where('status', 'verified')
                    ->where('created_at', '>=', $startOfMonth)
                    ->sum('amount'),
                'pending_payment_amount' => (float) DB::table('transactions')
                    ->whereIn('status', ['pending', 'submitted'])
                    ->sum('amount'),

                'total_subscriptions' => DB::table('subscriptions')->count(),
                'active_subscriptions' => DB::table('subscriptions')->where('status', 'active')->count(),
                'pending_subscriptions' => DB::table('subscriptions')->where('status', 'pending')->count(),
                'expired_subscriptions' => DB::table('subscriptions')->where('status', 'expired')->count(),

                'submitted_transactions' => DB::table('transactions')->where('status', 'submitted')->count(),
                'unread_messages' => DB::table('messages')
                    ->where('sender_type', 'user')
                    ->where('is_read', 0)
                    ->count(),
                'unread_notifications' => DB::table('notifications')
                    ->where('is_read', 0)
                    ->count(),
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