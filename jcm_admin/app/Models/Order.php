<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'order_code',
        'user_id',
        'product_id',
        'plan_id',
        'amount',
        'duration_days',
        'status',
        'ordered_at',
        'paid_at',
        'verified_at',
        'notes',
    ];

    protected $casts = [
        'ordered_at' => 'datetime',
        'paid_at' => 'datetime',
        'verified_at' => 'datetime',
        'amount' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function subscription()
    {
        return $this->hasOne(Subscription::class, 'order_id');
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'order_id');
    }

    public function latestTransaction()
    {
        return $this->hasOne(Transaction::class, 'order_id')->latestOfMany();
    }
}