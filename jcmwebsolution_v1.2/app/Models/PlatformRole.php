<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class PlatformRole extends Model
{
    protected $fillable = [
        'role_code',
        'name',
        'description',
        'is_system_role',
        'sort_order',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'is_system_role' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'user_platform_roles',
            'platform_role_id',
            'user_id',
        )->withPivot(['is_primary', 'status', 'assigned_by', 'assigned_at']);
    }
}
