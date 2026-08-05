<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoginActivity extends Model
{
    protected $table = 'login_activities';

    protected $fillable = [
        'user_id',
        'email_attempted',
        'event_type',
        'ip_address',
        'user_agent',
        'browser',
        'platform',
        'device_type',
        'session_id',
        'occurred_at',
    ];

    protected function casts(): array
    {
        return [
            'occurred_at' => 'datetime',
        ];
    }
}
