<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'role',
        'password',
        'created_by',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function platformRoles(): BelongsToMany
    {
        return $this->belongsToMany(
            PlatformRole::class,
            'user_platform_roles',
            'user_id',
            'platform_role_id',
        )
            ->withPivot(['is_primary', 'status', 'assigned_by', 'assigned_at'])
            ->withTimestamps();
    }

    public function hasPlatformRole(string|array $roles): bool
    {
        $roleCodes = (array) $roles;

        return $this->platformRoles()
            ->wherePivot('status', 'active')
            ->where('platform_roles.status', 'active')
            ->whereIn('platform_roles.role_code', $roleCodes)
            ->exists();
    }

    public function isAdmin(): bool
    {
        // Compatibility with the current Flagship login validation while the
        // canonical platform-role tables remain the primary role authority.
        if (in_array((string) $this->getAttribute('role'), ['super_admin', 'admin'], true)) {
            return true;
        }

        return $this->hasPlatformRole(['super_admin', 'admin']);
    }

    public function primaryPlatformRoleCode(): string
    {
        return (string) ($this->platformRoles()
            ->wherePivot('status', 'active')
            ->where('platform_roles.status', 'active')
            ->orderByDesc('user_platform_roles.is_primary')
            ->orderBy('platform_roles.sort_order')
            ->value('platform_roles.role_code') ?? 'user');
    }
}
