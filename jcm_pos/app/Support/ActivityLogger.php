<?php

namespace App\Support;

use App\Models\ActivityLog;
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

        $resolvedUserId = $userId ?: ($user?->id);
        $resolvedRole = $role ?: ($user?->role);

        $resolvedTenantId = $tenantId ?: (int) (
            $user?->client_id
            ?: $user?->created_by
            ?: $user?->id
            ?: 0
        );

        $resolvedBranchId = $branchId ?: ($user?->branch_id);

        return ActivityLog::create([
            'tenant_id' => $resolvedTenantId ?: null,
            'branch_id' => $resolvedBranchId ?: null,
            'user_id' => $resolvedUserId,
            'role' => $resolvedRole,

            'module' => $module,
            'action' => $action,
            'description' => $description,

            'subject_type' => $subject ? get_class($subject) : null,
            'subject_id' => $subject?->getKey(),

            'properties' => $properties ?: null,

            'ip_address' => request()?->ip(),
            'user_agent' => request()?->userAgent(),
        ]);
    }
}