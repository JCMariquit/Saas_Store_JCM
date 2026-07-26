<?php

namespace App\Services\Inventory;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

final class InventoryAccessContext
{
    public const PRODUCT_CODE = 'JCM-INVENTORY-001';

    /**
     * Resolve the canonical JCM Inventory account, role, subscription, and
     * branch scope for the authenticated SaaS user.
     *
     * @return array{
     *     user_id:int,
     *     account_owner_id:int,
     *     product_id:int,
     *     subscription_id:int,
     *     role_code:string,
     *     role_name:string,
     *     is_owner:bool,
     *     branch_id:?int
     * }
     */
    public function resolve(Request $request): array
    {
        $user = $request->user();
        $userId = (int) ($user?->id ?? 0);

        abort_unless($userId > 0, 401);

        $record = DB::connection('saas')
            ->table('user_product_access as access')
            ->join(
                'products as product',
                'product.id',
                '=',
                'access.product_id'
            )
            ->join(
                'product_user_types as product_role',
                function ($join): void {
                    $join
                        ->on(
                            'product_role.id',
                            '=',
                            'access.product_user_type_id'
                        )
                        ->on(
                            'product_role.product_id',
                            '=',
                            'access.product_id'
                        );
                }
            )
            ->join(
                'user_types as user_type',
                'user_type.id',
                '=',
                'product_role.user_type_id'
            )
            ->join(
                'subscriptions as subscription',
                function ($join): void {
                    $join
                        ->on(
                            'subscription.id',
                            '=',
                            'access.subscription_id'
                        )
                        ->on(
                            'subscription.product_id',
                            '=',
                            'access.product_id'
                        );
                }
            )
            ->where('access.user_id', $userId)
            ->where('access.status', 'active')
            ->where('product.product_code', self::PRODUCT_CODE)
            ->whereIn('product.status', ['development', 'active'])
            ->where('product_role.status', 'active')
            ->where('user_type.status', 'active')
            ->whereIn('subscription.status', ['trial', 'active'])
            ->orderByDesc('subscription.id')
            ->select([
                'access.account_owner_id',
                'access.product_id',
                'access.subscription_id',
                'product_role.display_name as role_name',
                'user_type.type_code as role_code',
                'user_type.is_owner_type',
            ])
            ->first();

        abort_unless(
            $record,
            403,
            'Your account does not have active access to JCM Inventory.'
        );

        $isOwner = (bool) $record->is_owner_type;
        $branchId = $isOwner
            ? null
            : (int) ($user?->branch_id ?? 0);

        if (! $isOwner && $branchId <= 0) {
            abort(
                403,
                'No branch is assigned to your inventory account.'
            );
        }

        return [
            'user_id' => $userId,
            'account_owner_id' => (int) $record->account_owner_id,
            'product_id' => (int) $record->product_id,
            'subscription_id' => (int) $record->subscription_id,
            'role_code' => (string) $record->role_code,
            'role_name' => (string) (
                $record->role_name ?: $record->role_code
            ),
            'is_owner' => $isOwner,
            'branch_id' => $branchId,
        ];
    }

    public function tenantId(Request $request): int
    {
        return $this->resolve($request)['account_owner_id'];
    }

    /**
     * @param array{is_owner:bool,branch_id:?int} $context
     */
    public function assertBranch(array $context, int $branchId): void
    {
        if ($context['is_owner']) {
            return;
        }

        abort_unless(
            $branchId > 0
                && $context['branch_id'] !== null
                && $branchId === (int) $context['branch_id'],
            403,
            'You may only access inventory records assigned to your branch.'
        );
    }

    /**
     * @param array{is_owner:bool,branch_id:?int} $context
     */
    public function selectedBranchId(
        array $context,
        mixed $requestedBranchId = null
    ): ?int {
        if (! $context['is_owner']) {
            return (int) $context['branch_id'];
        }

        $branchId = (int) ($requestedBranchId ?? 0);

        return $branchId > 0 ? $branchId : null;
    }
}
