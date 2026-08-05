<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Subscription;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

final class PaymentVerificationService
{
    public function __construct(
        private readonly PlatformAuditLogger $auditLogger,
    ) {
    }

    /**
     * Approve a submitted payment and synchronize the subscription and owner access.
     *
     * @return array{order_id:int,transaction_id:int|null,subscription_id:int}
     */
    public function approveTransaction(
        Request $request,
        Transaction $transaction,
        ?string $reviewNotes = null,
    ): array {
        return $this->approveOrder(
            $request,
            $transaction->order()->firstOrFail(),
            $transaction,
            $reviewNotes,
        );
    }

    /**
     * Approve an order. Trial orders may be approved without a payment transaction.
     *
     * @return array{order_id:int,transaction_id:int|null,subscription_id:int}
     */
    public function approveOrder(
        Request $request,
        Order $order,
        ?Transaction $transaction = null,
        ?string $reviewNotes = null,
    ): array {
        $actorId = $request->user()?->getKey();

        $result = DB::transaction(function () use (
            $actorId,
            $order,
            $transaction,
            $reviewNotes,
        ): array {
            $lockedOrder = Order::query()
                ->with(['plan:id,product_id,plan_name,price,duration_days'])
                ->lockForUpdate()
                ->findOrFail($order->getKey());

            if ($lockedOrder->status === 'verified') {
                $existingSubscriptionId = (int) ($lockedOrder->subscription_id ?: 0);

                if ($existingSubscriptionId < 1) {
                    throw ValidationException::withMessages([
                        'payment' => 'This order is marked verified but has no linked subscription.',
                    ]);
                }

                return [
                    'order_id' => (int) $lockedOrder->id,
                    'transaction_id' => $transaction?->getKey(),
                    'subscription_id' => $existingSubscriptionId,
                ];
            }

            if (in_array($lockedOrder->status, ['cancelled', 'failed'], true)) {
                throw ValidationException::withMessages([
                    'payment' => 'This order is closed and can no longer be approved.',
                ]);
            }

            $lockedTransaction = null;
            if ($transaction !== null) {
                $lockedTransaction = Transaction::query()
                    ->lockForUpdate()
                    ->findOrFail($transaction->getKey());

                if ((int) $lockedTransaction->order_id !== (int) $lockedOrder->id) {
                    throw ValidationException::withMessages([
                        'payment' => 'The selected payment does not belong to this order.',
                    ]);
                }
            }

            if ($lockedOrder->billing_type !== 'trial') {
                if ($lockedTransaction === null) {
                    $lockedTransaction = Transaction::query()
                        ->where('order_id', $lockedOrder->id)
                        ->whereIn('status', ['pending', 'submitted'])
                        ->latest('id')
                        ->lockForUpdate()
                        ->first();
                }

                if ($lockedTransaction === null) {
                    throw ValidationException::withMessages([
                        'payment' => 'A submitted payment is required before approval.',
                    ]);
                }

                if (! in_array($lockedTransaction->status, ['pending', 'submitted'], true)) {
                    throw ValidationException::withMessages([
                        'payment' => 'Only pending or submitted payments can be approved.',
                    ]);
                }
            }

            $now = now();
            $durationDays = max(
                1,
                (int) ($lockedOrder->duration_days
                    ?: $lockedOrder->plan?->duration_days
                    ?: 30),
            );

            $liveStatuses = [
                'pending',
                'trial',
                'active',
                'past_due',
                'grace_period',
                'suspended',
                'locked',
            ];

            $subscription = $lockedOrder->subscription_id
                ? Subscription::query()
                    ->lockForUpdate()
                    ->find($lockedOrder->subscription_id)
                : null;

            if ($subscription === null || ! in_array($subscription->status, $liveStatuses, true)) {
                $liveSubscription = Subscription::query()
                    ->where('account_owner_id', $lockedOrder->account_owner_id)
                    ->where('product_id', $lockedOrder->product_id)
                    ->whereIn('status', $liveStatuses)
                    ->lockForUpdate()
                    ->first();

                $subscription = $liveSubscription ?? $subscription;
            }

            $oldPlanId = $subscription?->plan_id;
            $oldStatus = $subscription?->status;
            $eventType = $this->resolveEventType($lockedOrder, $subscription);
            $subscriptionStatus = $lockedOrder->billing_type === 'trial'
                ? 'trial'
                : 'active';

            $periodStart = $now->copy();
            if (
                $lockedOrder->order_type === 'renewal'
                && $subscription?->current_period_end
                && $subscription->current_period_end->isFuture()
            ) {
                $periodStart = $subscription->current_period_end->copy();
            }

            $periodEnd = $periodStart->copy()->addDays($durationDays);

            $subscription ??= new Subscription([
                'subscription_code' => $this->generateSubscriptionCode(),
            ]);

            $subscription->fill([
                'user_id' => $lockedOrder->user_id,
                'account_owner_id' => $lockedOrder->account_owner_id,
                'product_id' => $lockedOrder->product_id,
                'plan_id' => $lockedOrder->plan_id,
                'plan_price_id' => $lockedOrder->plan_price_id,
                'subscription_type' => $lockedOrder->billing_type,
                'status' => $subscriptionStatus,
                'start_date' => $periodStart->toDateString(),
                'end_date' => $periodEnd->toDateString(),
                'trial_ends_at' => $subscriptionStatus === 'trial'
                    ? $periodEnd
                    : null,
                'current_period_start' => $periodStart,
                'current_period_end' => $periodEnd,
                'grace_ends_at' => null,
                'next_billing_at' => $subscriptionStatus === 'active'
                    ? $periodEnd
                    : null,
                'duration_days' => $durationDays,
                'amount' => $lockedOrder->amount,
                'currency' => $lockedOrder->currency,
                'activated_at' => $subscription->activated_at ?? $now,
                'ended_at' => null,
                'cancelled_at' => null,
                'cancellation_reason' => null,
                'last_payment_at' => $lockedTransaction ? $now : $subscription->last_payment_at,
                'notes' => $reviewNotes ?: $subscription->notes,
            ]);
            $subscription->save();

            if ($lockedTransaction !== null) {
                $lockedTransaction->update([
                    'status' => 'verified',
                    'paid_at' => $lockedTransaction->paid_at
                        ?? $lockedTransaction->submitted_at
                        ?? $now,
                    'verified_at' => $now,
                    'verified_by' => $actorId,
                    'notes' => $reviewNotes ?: $lockedTransaction->notes,
                ]);
            }

            $lockedOrder->update([
                'subscription_id' => $subscription->id,
                'status' => 'verified',
                'paid_at' => $lockedOrder->paid_at
                    ?? $lockedTransaction?->paid_at
                    ?? $now,
                'verified_at' => $now,
                'notes' => $reviewNotes ?: $lockedOrder->notes,
            ]);

            $this->syncOwnerProductAccess($subscription, $actorId);
            $this->writeSubscriptionEvent(
                subscription: $subscription,
                actorId: $actorId,
                order: $lockedOrder,
                transaction: $lockedTransaction,
                eventType: $eventType,
                oldPlanId: $oldPlanId,
                oldStatus: $oldStatus,
                notes: $reviewNotes,
                metadata: [
                    'source' => 'flagship_manual_payment_verification',
                    'amount_matches' => $lockedTransaction === null
                        || abs((float) $lockedTransaction->amount - (float) $lockedOrder->amount) < 0.01,
                ],
            );

            $this->notifyUsers(
                [$lockedOrder->user_id, $lockedOrder->account_owner_id],
                'Payment approved',
                sprintf(
                    'Your payment for %s has been approved. Subscription access is now active.',
                    $lockedOrder->order_code,
                ),
                'payment_approved',
            );

            return [
                'order_id' => (int) $lockedOrder->id,
                'transaction_id' => $lockedTransaction?->getKey(),
                'subscription_id' => (int) $subscription->id,
            ];
        });

        $this->auditLogger->write(
            request: $request,
            module: 'payment_verification',
            action: 'approved',
            description: 'Approved a submitted subscription payment and synchronized access.',
            subjectType: Transaction::class,
            subjectId: $result['transaction_id'],
            newValues: $result,
            metadata: ['review_notes' => $reviewNotes],
        );

        return $result;
    }

    /**
     * Reject a submitted payment while preserving the current subscription.
     *
     * @return array{order_id:int,transaction_id:int}
     */
    public function rejectTransaction(
        Request $request,
        Transaction $transaction,
        string $rejectionReason,
    ): array {
        $actorId = $request->user()?->getKey();

        $result = DB::transaction(function () use (
            $actorId,
            $transaction,
            $rejectionReason,
        ): array {
            $lockedTransaction = Transaction::query()
                ->lockForUpdate()
                ->findOrFail($transaction->getKey());

            $lockedOrder = Order::query()
                ->lockForUpdate()
                ->findOrFail($lockedTransaction->order_id);

            if (
                $lockedTransaction->status === 'verified'
                || in_array($lockedOrder->status, ['verified', 'cancelled', 'failed'], true)
            ) {
                throw ValidationException::withMessages([
                    'rejection_reason' => 'This payment/order is already closed and can no longer be rejected.',
                ]);
            }

            if (! in_array($lockedTransaction->status, ['pending', 'submitted'], true)) {
                throw ValidationException::withMessages([
                    'rejection_reason' => 'Only pending or submitted payments can be rejected.',
                ]);
            }

            $now = now();
            $lockedTransaction->update([
                'status' => 'rejected',
                'verified_at' => $now,
                'verified_by' => $actorId,
                'notes' => $rejectionReason,
            ]);

            $lockedOrder->update([
                // Return the order to pending so the subscriber can submit a
                // corrected reference/proof without creating a duplicate order.
                'status' => 'pending',
                'paid_at' => null,
                'verified_at' => null,
                'notes' => $rejectionReason,
            ]);

            if ($lockedOrder->subscription_id) {
                $subscription = Subscription::query()->find($lockedOrder->subscription_id);

                if ($subscription) {
                    $this->writeSubscriptionEvent(
                        subscription: $subscription,
                        actorId: $actorId,
                        order: $lockedOrder,
                        transaction: $lockedTransaction,
                        eventType: 'payment_failed',
                        oldPlanId: $subscription->plan_id,
                        oldStatus: $subscription->status,
                        notes: $rejectionReason,
                        metadata: ['source' => 'flagship_manual_payment_verification'],
                    );
                }
            }

            $this->notifyUsers(
                [$lockedOrder->user_id, $lockedOrder->account_owner_id],
                'Payment rejected',
                sprintf(
                    'Your payment for %s was rejected. Reason: %s',
                    $lockedOrder->order_code,
                    $rejectionReason,
                ),
                'payment_rejected',
            );

            return [
                'order_id' => (int) $lockedOrder->id,
                'transaction_id' => (int) $lockedTransaction->id,
            ];
        });

        $this->auditLogger->write(
            request: $request,
            module: 'payment_verification',
            action: 'rejected',
            description: 'Rejected a submitted subscription payment.',
            subjectType: Transaction::class,
            subjectId: $result['transaction_id'],
            newValues: $result,
            metadata: ['rejection_reason' => $rejectionReason],
        );

        return $result;
    }

    private function resolveEventType(Order $order, ?Subscription $subscription): string
    {
        if ($subscription === null) {
            return $order->billing_type === 'trial' ? 'trial_started' : 'activated';
        }

        return match ($order->order_type) {
            'renewal' => 'renewed',
            'upgrade' => 'upgraded',
            'downgrade' => 'downgraded',
            default => (int) $subscription->plan_id === (int) $order->plan_id
                ? 'renewed'
                : ((float) ($order->plan?->price ?? 0) >= (float) ($subscription->plan?->price ?? 0)
                    ? 'upgraded'
                    : 'downgraded'),
        };
    }

    private function syncOwnerProductAccess(Subscription $subscription, ?int $actorId): void
    {
        $ownerProductUserTypeId = DB::table('product_user_types')
            ->join('user_types', 'user_types.id', '=', 'product_user_types.user_type_id')
            ->where('product_user_types.product_id', $subscription->product_id)
            ->where('product_user_types.status', 'active')
            ->where(function ($query): void {
                $query->where('user_types.type_code', 'owner')
                    ->orWhere('user_types.is_owner_type', true);
            })
            ->orderByDesc('user_types.is_owner_type')
            ->value('product_user_types.id');

        if (! $ownerProductUserTypeId) {
            throw ValidationException::withMessages([
                'payment' => 'The selected product has no active owner role configured.',
            ]);
        }

        $lookup = [
            'user_id' => $subscription->account_owner_id,
            'product_id' => $subscription->product_id,
            'account_owner_id' => $subscription->account_owner_id,
        ];

        $values = [
            'product_user_type_id' => $ownerProductUserTypeId,
            'subscription_id' => $subscription->id,
            'status' => 'active',
            'assigned_by' => $actorId,
            'joined_at' => now(),
            'updated_at' => now(),
        ];

        $existingId = DB::table('user_product_access')->where($lookup)->value('id');

        if ($existingId) {
            DB::table('user_product_access')->where('id', $existingId)->update($values);
        } else {
            DB::table('user_product_access')->insert($lookup + $values + [
                'created_at' => now(),
            ]);
        }
    }

    private function writeSubscriptionEvent(
        Subscription $subscription,
        ?int $actorId,
        Order $order,
        ?Transaction $transaction,
        string $eventType,
        int|string|null $oldPlanId,
        ?string $oldStatus,
        ?string $notes,
        array $metadata,
    ): void {
        DB::table('subscription_events')->insert([
            'subscription_id' => $subscription->id,
            'actor_user_id' => $actorId,
            'order_id' => $order->id,
            'transaction_id' => $transaction?->id,
            'event_type' => $eventType,
            'old_plan_id' => $oldPlanId,
            'new_plan_id' => $subscription->plan_id,
            'old_status' => $oldStatus,
            'new_status' => $subscription->status,
            'notes' => $notes,
            'metadata' => json_encode($metadata, JSON_UNESCAPED_SLASHES),
            'created_at' => now(),
        ]);
    }

    /**
     * @param array<int,int|string|null> $userIds
     */
    private function notifyUsers(
        array $userIds,
        string $title,
        string $message,
        string $type,
    ): void {
        foreach (array_unique(array_filter(array_map('intval', $userIds))) as $userId) {
            DB::table('notifications')->insert([
                'user_id' => $userId,
                'title' => $title,
                'message' => $message,
                'type' => $type,
                // Existing JCM notification semantics: 1 = unread, 0 = read.
                'is_read' => 1,
                'read_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    private function generateSubscriptionCode(): string
    {
        do {
            $code = 'SUB-'.Str::upper(Str::random(10));
        } while (Subscription::query()->where('subscription_code', $code)->exists());

        return $code;
    }
}
