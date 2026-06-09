<?php

namespace App\Support;

use App\Models\ActivityLog;
use App\Models\SaasSubscription;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class ActivityLogger
{
    public static function log(
        string $module,
        string $action,
        string $description,
        ?Model $subject = null,
        array $properties = [],
        ?int $tenantId = null,
        ?int $branchId = null,
        ?int $userId = null,
        ?string $role = null
    ): ?ActivityLog {
        $user = Auth::user();

        if (!$user) {
            return null;
        }

        $resolvedTenantId = $tenantId ?: (int) (
            $user->client_id
            ?: $user->created_by
            ?: $user->id
        );

        if (!self::isEnabled($resolvedTenantId)) {
            return null;
        }

        return ActivityLog::create([
            'tenant_id' => $resolvedTenantId,
            'branch_id' => $branchId ?: $user->branch_id,
            'user_id' => $userId ?: $user->id,
            'role' => $role ?: $user->role,

            'module' => $module,
            'action' => $action,
            'description' => $description,

            'subject_type' => $subject ? get_class($subject) : null,
            'subject_id' => $subject?->getKey(),

            'properties' => !empty($properties) ? $properties : null,

            'ip_address' => request()?->ip(),
            'user_agent' => request()?->userAgent(),
        ]);
    }

    private static function isEnabled(int $tenantId): bool
    {
        $subscription = SaasSubscription::query()
            ->with('plan')
            ->where('user_id', $tenantId)
            ->where('status', 'active')
            ->whereDate('start_date', '<=', now())
            ->whereDate('end_date', '>=', now())
            ->latest('id')
            ->first();

        if (!$subscription || !$subscription->plan) {
            return false;
        }

        return (bool) $subscription->plan->has_activity_logs;
    }
}