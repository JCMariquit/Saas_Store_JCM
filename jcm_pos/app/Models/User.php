<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    protected $connection = 'saas';

    protected $table = 'users';

    protected $fillable = [
        'client_id',
        'branch_id',
        'system_used',
        'created_by',

        'name',
        'email',
        'password',
        'role',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_recovery_codes',
        'two_factor_secret',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',

            'client_id' => 'integer',
            'branch_id' => 'integer',
            'created_by' => 'integer',

            'is_active' => 'boolean',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeClients($query)
    {
        return $query->where('role', 'client');
    }

    public function scopeStaff($query)
    {
        return $query->whereIn('role', [
            'cashier',
            'staff',
            'manager',
        ]);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', 1);
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function isClient(): bool
    {
        return $this->role === 'client';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isCashier(): bool
    {
        return $this->role === 'cashier';
    }

    public function isStaff(): bool
    {
        return in_array($this->role, [
            'cashier',
            'staff',
            'manager',
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Multi Tenant Helper
    |--------------------------------------------------------------------------
    |
    | Client:
    | own id
    |
    | Staff:
    | owner/client id
    |
    */

    public function tenantId(): int
    {
        return (int) ($this->client_id ?: $this->id);
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function owner()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function staff()
    {
        return $this->hasOne(Staff::class, 'original_user_id');
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class, 'branch_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}