<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SaasSubscription extends Model
{
    protected $connection = 'saas';

    protected $table = 'subscriptions';

    protected $fillable = [
        'user_id',
        'product_id',
        'order_id',
        'plan_id',
        'subscription_code',
        'subscription_type',
        'status',
        'start_date',
        'end_date',
        'duration_days',
        'amount',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'duration_days' => 'integer',
            'amount' => 'decimal:2',
        ];
    }

    public function plan()
    {
        return $this->belongsTo(SaasPlan::class, 'plan_id');
    }
}