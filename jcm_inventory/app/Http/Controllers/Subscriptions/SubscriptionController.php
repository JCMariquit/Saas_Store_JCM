<?php

namespace App\Http\Controllers\Subscriptions;

use App\Http\Controllers\Controller;
use App\Services\Subscriptions\SubscriptionAccessService;
use App\Services\Subscriptions\SubscriptionCatalogService;
use Illuminate\Database\ConnectionInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

final class SubscriptionController extends Controller
{
    public function __construct(
        private readonly SubscriptionAccessService $access,
        private readonly SubscriptionCatalogService $catalog
    ) {
    }

    public function index(Request $request): Response
    {
        $user = $request->user();
        $context = $this->access->summary($user);
        $ownerId = $context['account_owner_id'] ?? $user->getKey();
        $productCode = (string) config(
            'jcm.product_code',
            'JCM-INVENTORY-001'
        );

        $productId = $this->connection()
            ->table('products')
            ->where('product_code', $productCode)
            ->value('id');

        $pendingOrderRecord = $this->connection()
            ->table('orders')
            ->where('account_owner_id', $ownerId)
            ->where('product_id', $productId)
            ->whereIn('status', [
                'pending',
                'payment_submitted',
            ])
            ->orderByDesc('id')
            ->first([
                'id',
                'order_code',
                'plan_id',
                'plan_price_id',
                'billing_type',
                'order_type',
                'amount',
                'currency',
                'status',
                'ordered_at',
            ]);

        $pendingOrder = $pendingOrderRecord !== null
            ? [
                'id' => (int) $pendingOrderRecord->id,
                'order_code' => $pendingOrderRecord->order_code,
                'plan_id' => (int) $pendingOrderRecord->plan_id,
                'plan_price_id' =>
                    (int) $pendingOrderRecord->plan_price_id,
                'billing_type' =>
                    $pendingOrderRecord->billing_type,
                'order_type' => $pendingOrderRecord->order_type,
                'amount' => (float) $pendingOrderRecord->amount,
                'currency' => $pendingOrderRecord->currency,
                'status' => $pendingOrderRecord->status,
                'ordered_at' => $pendingOrderRecord->ordered_at,
            ]
            : null;

        $paymentMethods = $this->connection()
            ->table('payment_methods')
            ->where('status', 1)
            ->orderBy('sort_order')
            ->get([
                'id',
                'name',
                'slug',
                'account_name',
                'account_number',
                'instructions',
                'image_path',
            ])
            ->map(fn (object $method): array => [
                'id' => (int) $method->id,
                'name' => $method->name,
                'slug' => $method->slug,
                'account_name' => $method->account_name,
                'account_number' => $method->account_number,
                'instructions' => $method->instructions,
                'image_path' => $method->image_path,
            ])
            ->values()
            ->all();

        return Inertia::render('settings/subscription/index', [
            'current' => $context,
            'plans' => $this->catalog->get($productCode),
            'pendingOrder' => $pendingOrder,
            'paymentMethods' => $paymentMethods,
        ]);
    }

    private function connection(): ConnectionInterface
    {
        return DB::connection(
            (string) config('jcm.saas_connection', 'saas')
        );
    }
}
