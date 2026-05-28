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
        'name',
        'email',
        'password',
        'role',
        'client_id',
        'created_by',
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
            'is_active' => 'boolean',
        ];
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function staff()
    {
        return $this->hasMany(User::class, 'client_id')
            ->where('role', 'cashier');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function createdUsers()
    {
        return $this->hasMany(User::class, 'created_by');
    }

    public function scopeClients($query)
    {
        return $query->where('role', 'client');
    }

    public function scopeCashiers($query)
    {
        return $query->where('role', 'cashier');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', 1);
    }

    public function isClient(): bool
    {
        return $this->role === 'client';
    }

    public function isCashier(): bool
    {
        return $this->role === 'cashier';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }
}