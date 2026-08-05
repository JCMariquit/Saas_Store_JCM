<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    protected $fillable = [
        'transaction_code',
        'order_id',
        'user_id',
        'payment_method_id',
        'reference_number',
        'account_name',
        'account_number',
        'amount',
        'payment_proof',
        'status',
        'submitted_at',
        'paid_at',
        'verified_at',
        'refunded_at',
        'notes',
        'verified_by',
    ];

    protected function casts(): array
    {
        return [
            'submitted_at' => 'datetime',
            'paid_at' => 'datetime',
            'verified_at' => 'datetime',
            'refunded_at' => 'datetime',
            'amount' => 'decimal:2',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class);
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
