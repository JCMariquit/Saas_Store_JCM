<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentMethod;
use App\Models\Product;
use App\Models\Transaction;
use App\Services\PaymentVerificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

final class PaymentVerificationController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $status = (string) $request->query('status', 'pending');
        $productId = $request->integer('product_id') ?: null;
        $paymentMethodId = $request->integer('payment_method_id') ?: null;
        $dateFrom = trim((string) $request->query('date_from', ''));
        $dateTo = trim((string) $request->query('date_to', ''));
        $sort = (string) $request->query('sort', 'newest');

        if (! in_array($status, ['pending', 'approved', 'rejected', 'all'], true)) {
            $status = 'pending';
        }

        if (! in_array($sort, ['newest', 'oldest', 'amount_high', 'amount_low'], true)) {
            $sort = 'newest';
        }

        $query = Transaction::query()
            ->with([
                'user:id,name,email',
                'verifier:id,name,email',
                'paymentMethod:id,name,slug,account_name,account_number',
                'order:id,order_code,user_id,account_owner_id,product_id,plan_id,plan_price_id,billing_type,subscription_id,order_type,amount,currency,duration_days,status,ordered_at,paid_at,verified_at,notes',
                'order.accountOwner:id,name,email',
                'order.product:id,product_code,name,app_url',
                'order.plan:id,product_id,plan_name,price,currency,duration_days',
                'order.subscription:id,subscription_code,status,current_period_end',
            ])
            ->whereHas('order', fn ($orderQuery) => $orderQuery->whereNotNull('product_id'))
            ->when($status === 'pending', fn ($builder) => $builder->whereIn('status', ['pending', 'submitted']))
            ->when($status === 'approved', fn ($builder) => $builder->where('status', 'verified'))
            ->when($status === 'rejected', fn ($builder) => $builder->whereIn('status', ['rejected', 'failed']))
            ->when($productId, fn ($builder) => $builder->whereHas('order', fn ($orderQuery) => $orderQuery->where('product_id', $productId)))
            ->when($paymentMethodId, fn ($builder) => $builder->where('payment_method_id', $paymentMethodId))
            ->when($dateFrom !== '', fn ($builder) => $builder->whereDate('submitted_at', '>=', $dateFrom))
            ->when($dateTo !== '', fn ($builder) => $builder->whereDate('submitted_at', '<=', $dateTo))
            ->when($search !== '', function ($builder) use ($search): void {
                $builder->where(function ($nested) use ($search): void {
                    $nested->where('transaction_code', 'like', "%{$search}%")
                        ->orWhere('reference_number', 'like', "%{$search}%")
                        ->orWhere('account_name', 'like', "%{$search}%")
                        ->orWhere('account_number', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($userQuery) use ($search): void {
                            $userQuery->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        })
                        ->orWhereHas('order', function ($orderQuery) use ($search): void {
                            $orderQuery->where('order_code', 'like', "%{$search}%")
                                ->orWhereHas('accountOwner', function ($ownerQuery) use ($search): void {
                                    $ownerQuery->where('name', 'like', "%{$search}%")
                                        ->orWhere('email', 'like', "%{$search}%");
                                })
                                ->orWhereHas('product', fn ($productQuery) => $productQuery->where('name', 'like', "%{$search}%"))
                                ->orWhereHas('plan', fn ($planQuery) => $planQuery->where('plan_name', 'like', "%{$search}%"));
                        })
                        ->orWhereHas('paymentMethod', fn ($methodQuery) => $methodQuery->where('name', 'like', "%{$search}%"));
                });
            });

        match ($sort) {
            'oldest' => $query->orderBy('submitted_at')->orderBy('id'),
            'amount_high' => $query->orderByDesc('amount')->orderByDesc('id'),
            'amount_low' => $query->orderBy('amount')->orderByDesc('id'),
            default => $query->orderByDesc('submitted_at')->orderByDesc('id'),
        };

        $payments = $query
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Transaction $transaction): array => $this->serialize($transaction));

        $today = now()->toDateString();

        return Inertia::render('admin/payment-verifications/index', [
            'filters' => [
                'search' => $search,
                'status' => $status,
                'product_id' => $productId,
                'payment_method_id' => $paymentMethodId,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'sort' => $sort,
            ],
            'payments' => $payments,
            'products' => Product::query()
                ->whereHas('orders.transactions')
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (Product $product): array => [
                    'id' => (int) $product->id,
                    'name' => $product->name,
                ]),
            'paymentMethods' => PaymentMethod::query()
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (PaymentMethod $method): array => [
                    'id' => (int) $method->id,
                    'name' => $method->name,
                ]),
            'stats' => [
                'pending_count' => Transaction::query()->whereIn('status', ['pending', 'submitted'])->count(),
                'pending_amount' => (float) Transaction::query()->whereIn('status', ['pending', 'submitted'])->sum('amount'),
                'approved_today' => Transaction::query()->where('status', 'verified')->whereDate('verified_at', $today)->count(),
                'rejected_today' => Transaction::query()->whereIn('status', ['rejected', 'failed'])->whereDate('verified_at', $today)->count(),
            ],
        ]);
    }

    public function approve(
        Request $request,
        Transaction $transaction,
        PaymentVerificationService $service,
    ): RedirectResponse {
        $validated = $request->validate([
            'review_notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $service->approveTransaction(
            $request,
            $transaction,
            $validated['review_notes'] ?? null,
        );

        return back()->with('success', 'Payment approved. Subscription and product access were synchronized.');
    }

    public function reject(
        Request $request,
        Transaction $transaction,
        PaymentVerificationService $service,
    ): RedirectResponse {
        $validated = $request->validate([
            'rejection_reason' => ['required', 'string', 'min:5', 'max:2000'],
        ]);

        $service->rejectTransaction(
            $request,
            $transaction,
            $validated['rejection_reason'],
        );

        return back()->with('success', 'Payment rejected. The subscriber was notified with the rejection reason.');
    }

    public function proof(Transaction $transaction): BinaryFileResponse|RedirectResponse|HttpResponse
    {
        $transaction->loadMissing('order.product:id,product_code,app_url');
        $storedPath = trim((string) $transaction->payment_proof);

        abort_if($storedPath === '', 404, 'This payment has no uploaded proof.');

        $relativePath = ltrim(str_replace('\\', '/', $storedPath), '/');
        abort_if(str_contains($relativePath, '..'), 403, 'Invalid payment-proof path.');

        foreach ($this->proofRoots($transaction) as $root) {
            $candidate = rtrim($root, DIRECTORY_SEPARATOR)
                .DIRECTORY_SEPARATOR
                .str_replace('/', DIRECTORY_SEPARATOR, $relativePath);

            if (File::isFile($candidate)) {
                return response()->file($candidate, [
                    'Cache-Control' => 'private, no-store, max-age=0',
                    'Content-Disposition' => 'inline; filename="'.basename($candidate).'"',
                ]);
            }
        }

        $appUrl = trim((string) $transaction->order?->product?->app_url);
        if ($appUrl !== '' && filter_var($appUrl, FILTER_VALIDATE_URL)) {
            $scheme = strtolower((string) parse_url($appUrl, PHP_URL_SCHEME));
            if (in_array($scheme, ['http', 'https'], true)) {
                return redirect()->away(
                    rtrim($appUrl, '/').'/storage/'.$relativePath,
                );
            }
        }

        return response(
            'Payment proof was recorded, but the source application storage path is not configured in the Flagship .env file.',
            404,
            ['Content-Type' => 'text/plain; charset=UTF-8'],
        );
    }

    private function serialize(Transaction $transaction): array
    {
        $order = $transaction->order;
        $expectedAmount = (float) ($order?->amount ?? 0);
        $submittedAmount = (float) $transaction->amount;

        return [
            'id' => (int) $transaction->id,
            'transaction_code' => $transaction->transaction_code,
            'status' => $transaction->status,
            'reference_number' => $transaction->reference_number,
            'account_name' => $transaction->account_name,
            'account_number' => $transaction->account_number,
            'amount' => $submittedAmount,
            'expected_amount' => $expectedAmount,
            'amount_matches' => abs($submittedAmount - $expectedAmount) < 0.01,
            'payment_proof' => $transaction->payment_proof,
            'proof_url' => $transaction->payment_proof
                ? URL::route('admin.payment-verifications.proof', $transaction->id, false)
                : null,
            'status_label' => str($transaction->status)->replace('_', ' ')->title()->toString(),
            'submitted_at' => $transaction->submitted_at?->format('M d, Y h:i A'),
            'reviewed_at' => $transaction->verified_at?->format('M d, Y h:i A'),
            'review_notes' => $transaction->notes,
            'reviewer_name' => $transaction->verifier?->name,
            'payment_method' => [
                'id' => $transaction->paymentMethod?->id,
                'name' => $transaction->paymentMethod?->name,
                'slug' => $transaction->paymentMethod?->slug,
                'destination_name' => $transaction->paymentMethod?->account_name,
                'destination_number' => $transaction->paymentMethod?->account_number,
            ],
            'subscriber' => [
                'id' => $order?->accountOwner?->id ?? $transaction->user?->id,
                'name' => $order?->accountOwner?->name ?? $transaction->user?->name,
                'email' => $order?->accountOwner?->email ?? $transaction->user?->email,
            ],
            'order' => [
                'id' => $order?->id,
                'order_code' => $order?->order_code,
                'status' => $order?->status,
                'order_type' => $order?->order_type,
                'billing_type' => $order?->billing_type,
                'currency' => $order?->currency ?? 'PHP',
                'duration_days' => (int) ($order?->duration_days ?? 0),
                'ordered_at' => $order?->ordered_at?->format('M d, Y h:i A'),
            ],
            'product' => [
                'id' => $order?->product?->id,
                'code' => $order?->product?->product_code,
                'name' => $order?->product?->name,
            ],
            'plan' => [
                'id' => $order?->plan?->id,
                'name' => $order?->plan?->plan_name,
            ],
            'subscription' => $order?->subscription ? [
                'id' => $order->subscription->id,
                'code' => $order->subscription->subscription_code,
                'status' => $order->subscription->status,
                'current_period_end' => $order->subscription->current_period_end?->format('M d, Y h:i A'),
            ] : null,
            'can_review' => in_array($transaction->status, ['pending', 'submitted'], true)
                && ! in_array((string) $order?->status, ['verified', 'cancelled', 'failed'], true),
        ];
    }

    /**
     * @return array<int,string>
     */
    private function proofRoots(Transaction $transaction): array
    {
        $configuredRoots = (array) config('jcm.payment_proof_roots', []);
        $productCode = (string) $transaction->order?->product?->product_code;

        $roots = [
            storage_path('app/public'),
            public_path('storage'),
        ];

        if ($productCode === 'JCM-INVENTORY-001') {
            $roots[] = (string) config('jcm.inventory_public_storage_path');
            $roots[] = base_path('../jcm_inventory/storage/app/public');
            $roots[] = base_path('../JCM_Inventory/storage/app/public');
        }

        return array_values(array_unique(array_filter([
            ...$roots,
            ...$configuredRoots,
        ], fn ($root): bool => is_string($root) && trim($root) !== '')));
    }
}
