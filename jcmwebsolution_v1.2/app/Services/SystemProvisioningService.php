<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use RuntimeException;
use Throwable;

class SystemProvisioningService
{
    public function __construct(private readonly PlatformAuditLogger $auditLogger) {}

    public function provision(Request $request, array $data): array
    {
        $actorId = $request->user()?->getKey();

        return DB::transaction(function () use ($request, $data, $actorId): array {
            $product = DB::table('products')->where('id', $data['product_id'])->lockForUpdate()->first();
            $plan = DB::table('plans')
                ->where('id', $data['plan_id'])
                ->where('product_id', $data['product_id'])
                ->where('status', 'active')
                ->lockForUpdate()
                ->first();

            if (! $product || ! $plan) {
                throw new RuntimeException('The selected system or plan is unavailable.');
            }

            $user = $this->resolveUser($data, $actorId);
            $ownerType = DB::table('product_user_types as product_roles')
                ->join('user_types', 'user_types.id', '=', 'product_roles.user_type_id')
                ->where('product_roles.product_id', $product->id)
                ->where('product_roles.status', 'active')
                ->where('user_types.is_owner_type', true)
                ->select('product_roles.id')
                ->first();

            if (! $ownerType) {
                throw new RuntimeException('This system has no active owner role. Configure Product Roles first.');
            }

            DB::table('account_business_profiles')->updateOrInsert(
                ['account_owner_id' => $user->id],
                [
                    'business_name' => $data['business_name'],
                    'business_category' => $data['business_category'] ?? null,
                    'contact_email' => $data['contact_email'] ?: $user->email,
                    'contact_phone' => $data['contact_phone'] ?? null,
                    'address_line' => $data['address_line'] ?? null,
                    'country_code' => 'PH',
                    'created_by' => $actorId,
                    'updated_by' => $actorId,
                    'updated_at' => now(),
                    'created_at' => now(),
                ],
            );

            $price = DB::table('plan_prices')
                ->where('plan_id', $plan->id)
                ->where('status', 'active')
                ->when(! empty($data['billing_interval']), fn ($query) => $query->where('billing_interval', $data['billing_interval']))
                ->orderByDesc('is_default')
                ->orderBy('sort_order')
                ->first();

            $durationDays = (int) ($price?->duration_days ?? $plan->duration_days ?? 30);
            $status = $data['subscription_status'];
            $now = now();
            $subscriptionId = DB::table('subscriptions')->insertGetId([
                'user_id' => $user->id,
                'account_owner_id' => $user->id,
                'product_id' => $product->id,
                'plan_id' => $plan->id,
                'plan_price_id' => $price?->id,
                'subscription_code' => 'SUB-'.now()->format('YmdHis').'-'.strtoupper(Str::random(6)),
                'subscription_type' => $status === 'trial' ? 'trial' : ($price?->billing_interval ?? $plan->billing_interval),
                'status' => $status,
                'start_date' => $now->toDateString(),
                'end_date' => $now->copy()->addDays($durationDays)->toDateString(),
                'trial_ends_at' => $status === 'trial' ? $now->copy()->addDays((int) ($plan->trial_days ?? 0)) : null,
                'current_period_start' => $now,
                'current_period_end' => $now->copy()->addDays($durationDays),
                'duration_days' => $durationDays,
                'amount' => $price?->price ?? $plan->price,
                'currency' => $price?->currency ?? $plan->currency ?? 'PHP',
                'activated_at' => in_array($status, ['trial', 'active'], true) ? $now : null,
                'notes' => $data['notes'] ?? null,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            $accessId = DB::table('user_product_access')->insertGetId([
                'user_id' => $user->id,
                'product_id' => $product->id,
                'product_user_type_id' => $ownerType->id,
                'account_owner_id' => $user->id,
                'subscription_id' => $subscriptionId,
                'status' => in_array($status, ['trial', 'active', 'past_due', 'grace_period'], true) ? 'active' : 'pending',
                'assigned_by' => $actorId,
                'joined_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            DB::table('subscription_events')->insert([
                'subscription_id' => $subscriptionId,
                'actor_user_id' => $actorId,
                'event_type' => $status === 'trial' ? 'trial_started' : ($status === 'active' ? 'activated' : 'created'),
                'new_plan_id' => $plan->id,
                'new_status' => $status,
                'notes' => 'Provisioned from JCM Flagship Administration.',
                'metadata' => json_encode(['source' => 'systems_provisioner'], JSON_UNESCAPED_SLASHES),
                'created_at' => $now,
            ]);

            $operational = ['branch_id' => null, 'warehouse_id' => null];
            if ((string) $product->product_code === 'JCM-INVENTORY-001') {
                $operational = $this->provisionInventory($user->id, $actorId, $data);

                foreach ([
                    ['type' => 'branch', 'id' => $operational['branch_id']],
                    ['type' => 'warehouse', 'id' => $operational['warehouse_id']],
                ] as $scope) {
                    DB::table('user_product_access_scopes')->insert([
                        'access_id' => $accessId,
                        'scope_type' => $scope['type'],
                        'scope_id' => $scope['id'],
                        'is_primary' => true,
                        'status' => 'active',
                        'metadata' => json_encode(['provisioned' => true]),
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }
            }

            if (DB::getSchemaBuilder()->hasTable('system_provisioning_logs')) {
                DB::table('system_provisioning_logs')->insert([
                    'account_owner_id' => $user->id,
                    'product_id' => $product->id,
                    'plan_id' => $plan->id,
                    'subscription_id' => $subscriptionId,
                    'provisioned_by' => $actorId,
                    'status' => 'completed',
                    'business_name' => $data['business_name'],
                    'branch_id' => $operational['branch_id'],
                    'warehouse_id' => $operational['warehouse_id'],
                    'details' => json_encode(['access_id' => $accessId, 'product_code' => $product->product_code], JSON_UNESCAPED_SLASHES),
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }

            $this->auditLogger->write(
                $request,
                'systems',
                'provisioned',
                "Provisioned {$product->name} for {$user->email}.",
                'subscription',
                $subscriptionId,
                null,
                ['user_id' => $user->id, 'product_id' => $product->id, 'plan_id' => $plan->id] + $operational,
            );

            return [
                'user_id' => $user->id,
                'subscription_id' => $subscriptionId,
                'access_id' => $accessId,
            ] + $operational;
        });
    }

    private function resolveUser(array $data, ?int $actorId): User
    {
        if (! empty($data['existing_user_id'])) {
            return User::query()->where('is_active', true)->findOrFail($data['existing_user_id']);
        }

        $user = User::query()->create([
            'name' => $data['name'],
            'email' => mb_strtolower($data['email']),
            'role' => 'client',
            'password' => Hash::make($data['password']),
            'created_by' => $actorId,
            'is_active' => true,
        ]);

        $platformRoleId = DB::table('platform_roles')->where('role_code', 'user')->value('id');
        if ($platformRoleId) {
            DB::table('user_platform_roles')->insert([
                'user_id' => $user->id,
                'platform_role_id' => $platformRoleId,
                'is_primary' => true,
                'status' => 'active',
                'assigned_by' => $actorId,
                'assigned_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return $user;
    }

    private function provisionInventory(int $tenantId, ?int $actorId, array $data): array
    {
        try {
            return DB::connection('inventory')->transaction(function () use ($tenantId, $actorId, $data): array {
                $branchId = DB::connection('inventory')->table('branches')->insertGetId([
                    'tenant_id' => $tenantId,
                    'name' => $data['branch_name'] ?: 'Main Branch',
                    'code' => 'MAIN',
                    'address' => $data['address_line'] ?? null,
                    'email' => $data['contact_email'] ?? null,
                    'phone' => $data['contact_phone'] ?? null,
                    'is_main' => true,
                    'is_active' => true,
                    'created_by' => $actorId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $warehouseId = DB::connection('inventory')->table('warehouses')->insertGetId([
                    'tenant_id' => $tenantId,
                    'branch_id' => $branchId,
                    'name' => $data['warehouse_name'] ?: 'Main Warehouse',
                    'code' => 'MAIN-WH',
                    'description' => 'Default warehouse provisioned by JCM Flagship.',
                    'address' => $data['address_line'] ?? null,
                    'is_main' => true,
                    'is_active' => true,
                    'created_by' => $actorId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                return ['branch_id' => $branchId, 'warehouse_id' => $warehouseId];
            });
        } catch (Throwable $exception) {
            throw new RuntimeException('Inventory account setup failed: '.$exception->getMessage(), 0, $exception);
        }
    }
}
