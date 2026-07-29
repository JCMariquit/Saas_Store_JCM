<?php

namespace App\Services\Inventory;

use App\Services\Subscriptions\SubscriptionAccessService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

final class InventoryAccessContext
{
    public const PRODUCT_CODE = 'JCM-INVENTORY-001';

    public function __construct(
        private readonly SubscriptionAccessService $subscriptions
    ) {
    }

    /**
     * Resolve the canonical JCM Inventory account, role, subscription,
     * access mode, and branch scope for the authenticated SaaS user.
     *
     * Owner, Manager, and Staff all inherit the same owner subscription.
     *
     * Active and trial:
     *     Full access.
     *
     * Past due, grace period, and expired:
     *     Read-only access.
     *
     * Suspended, locked, removed membership, or no subscription:
     *     Blocked.
     *
     * @return array{
     *     access_id:int,
     *     user_id:int,
     *     account_owner_id:int,
     *     product_id:int,
     *     subscription_id:int,
     *     subscription_status:string,
     *     access_mode:string,
     *     can_write:bool,
     *     can_export:bool,
     *     role_code:string,
     *     role_name:string,
     *     is_owner:bool,
     *     branch_id:?int
     * }
     */
    public function resolve(
        Request $request
    ): array {
        $user = $request->user();
        $userId = (int) ($user?->id ?? 0);

        abort_unless(
            $userId > 0,
            401
        );

        $context = $this->subscriptions
            ->summary($user);

        abort_unless(
            $context !== null
                && $context['product_code']
                    === self::PRODUCT_CODE,
            403,
            'Your account is not assigned to JCM Inventory.'
        );

        abort_if(
            $context['access_mode'] === 'blocked',
            403,
            'Your JCM Inventory subscription is unavailable. Renew or reactivate the owner subscription.'
        );

        $subscriptionId = (int) (
            $context['subscription_id'] ?? 0
        );

        abort_unless(
            $subscriptionId > 0,
            403,
            'Your account is not linked to an Inventory subscription.'
        );

        $isOwner = (bool) $context['is_owner'];

        $branchId = $isOwner
            ? null
            : $this->resolvePrimaryBranchId(
                (int) $context['access_id']
            );

        if (
            ! $isOwner
            && $branchId === null
        ) {
            abort(
                403,
                'No active branch scope is assigned to your inventory account.'
            );
        }

        return [
            'access_id' =>
                (int) $context['access_id'],

            'user_id' =>
                $userId,

            'account_owner_id' =>
                (int) $context[
                    'account_owner_id'
                ],

            'product_id' =>
                (int) $context['product_id'],

            'subscription_id' =>
                $subscriptionId,

            'subscription_status' =>
                (string) $context[
                    'subscription_status'
                ],

            'access_mode' =>
                (string) $context[
                    'access_mode'
                ],

            'can_write' =>
                (bool) $context['can_write'],

            'can_export' =>
                (bool) $context['can_write'],

            'role_code' =>
                (string) $context['role_code'],

            'role_name' =>
                (string) (
                    $context['role_name']
                    ?: $context['role_code']
                ),

            'is_owner' =>
                $isOwner,

            'branch_id' =>
                $branchId,
        ];
    }

    public function tenantId(
        Request $request
    ): int {
        return $this->resolve(
            $request
        )['account_owner_id'];
    }

    public function accessMode(
        Request $request
    ): string {
        return $this->resolve(
            $request
        )['access_mode'];
    }

    public function canWrite(
        Request $request
    ): bool {
        return $this->resolve(
            $request
        )['can_write'];
    }

    public function canExport(
        Request $request
    ): bool {
        return $this->resolve(
            $request
        )['can_export'];
    }

    /**
     * @param array{
     *     is_owner:bool,
     *     branch_id:?int
     * } $context
     */
    public function assertBranch(
        array $context,
        int $branchId
    ): void {
        if ($context['is_owner']) {
            return;
        }

        abort_unless(
            $branchId > 0
                && $context['branch_id'] !== null
                && $branchId ===
                    (int) $context['branch_id'],
            403,
            'You may only access inventory records assigned to your branch.'
        );
    }

    /**
     * @param array{
     *     is_owner:bool,
     *     branch_id:?int
     * } $context
     */
    public function selectedBranchId(
        array $context,
        mixed $requestedBranchId = null
    ): ?int {
        if (! $context['is_owner']) {
            return (int) $context[
                'branch_id'
            ];
        }

        $branchId = (int) (
            $requestedBranchId ?? 0
        );

        return $branchId > 0
            ? $branchId
            : null;
    }

    private function resolvePrimaryBranchId(
        int $accessId
    ): ?int {
        $branchId = DB::connection(
            (string) config(
                'jcm.saas_connection',
                'saas'
            )
        )
            ->table(
                'user_product_access_scopes'
            )
            ->where(
                'access_id',
                $accessId
            )
            ->where(
                'scope_type',
                'branch'
            )
            ->where(
                'status',
                'active'
            )
            ->orderByDesc(
                'is_primary'
            )
            ->orderBy(
                'id'
            )
            ->value(
                'scope_id'
            );

        $branchId = (int) (
            $branchId ?? 0
        );

        return $branchId > 0
            ? $branchId
            : null;
    }
}