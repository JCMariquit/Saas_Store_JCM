<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'account_owner_id',
        'product_id',
        'plan_id',
        'plan_price_id',
        'subscription_code',
        'subscription_type',
        'status',
        'start_date',
        'end_date',
        'trial_ends_at',
        'current_period_start',
        'current_period_end',
        'grace_ends_at',
        'next_billing_at',
        'duration_days',
        'amount',
        'currency',
        'auto_renew',
        'cancel_at_period_end',
        'activated_at',
        'cancelled_at',
        'cancellation_reason',
        'ended_at',
        'last_payment_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'trial_ends_at' => 'datetime',
            'current_period_start' => 'datetime',
            'current_period_end' => 'datetime',
            'grace_ends_at' => 'datetime',
            'next_billing_at' => 'datetime',
            'activated_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'ended_at' => 'datetime',
            'last_payment_at' => 'datetime',
            'duration_days' => 'integer',
            'amount' => 'decimal:2',
            'auto_renew' => 'boolean',
            'cancel_at_period_end' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function accountOwner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'account_owner_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }


}
