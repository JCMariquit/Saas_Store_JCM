<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    protected $fillable = [
        'user_id',
        'product_id',
        'subscription_code',
        'subscription_type',
        'status',
        'start_date',
        'end_date',
        'duration_days',
        'amount',
        'payment_method',
        'reference_number',
        'verified_at',
        'notes',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'verified_at' => 'datetime',
    ];

    // 🔗 RELATIONSHIPS

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}