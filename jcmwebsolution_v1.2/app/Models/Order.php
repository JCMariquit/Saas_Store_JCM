<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    protected $fillable = [
        'order_code',
        'user_id',
        'account_owner_id',
        'product_id',
        'service_id',
        'plan_id',
        'plan_price_id',
        'billing_type',
        'subscription_id',
        'order_type',
        'amount',
        'currency',
        'duration_days',
        'status',
        'ordered_at',
        'paid_at',
        'verified_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'ordered_at' => 'datetime',
            'paid_at' => 'datetime',
            'verified_at' => 'datetime',
            'amount' => 'decimal:2',
            'duration_days' => 'integer',
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

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function latestTransaction(): HasOne
    {
        return $this->hasOne(Transaction::class)->latestOfMany();
    }
}
