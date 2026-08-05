<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class PlatformAuditLogger
{
    public function write(
        Request $request,
        string $module,
        string $action,
        string $description,
        ?string $subjectType = null,
        int|string|null $subjectId = null,
        mixed $oldValues = null,
        mixed $newValues = null,
        array $metadata = [],
    ): void {
        if (! Schema::hasTable('platform_audit_logs')) {
            return;
        }

        DB::table('platform_audit_logs')->insert([
            'actor_user_id' => $request->user()?->getKey(),
            'module' => $module,
            'action' => $action,
            'subject_type' => $subjectType,
            'subject_id' => $subjectId === null ? null : (string) $subjectId,
            'description' => $description,
            'old_values' => $oldValues === null ? null : json_encode($oldValues, JSON_UNESCAPED_SLASHES),
            'new_values' => $newValues === null ? null : json_encode($newValues, JSON_UNESCAPED_SLASHES),
            'metadata' => $metadata === [] ? null : json_encode($metadata, JSON_UNESCAPED_SLASHES),
            'ip_address' => $request->ip(),
            'user_agent' => mb_substr((string) $request->userAgent(), 0, 1000),
            'created_at' => now(),
        ]);
    }
}
