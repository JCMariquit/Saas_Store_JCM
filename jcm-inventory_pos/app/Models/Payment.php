<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $connection = 'pos';

    protected $fillable = [
        'tenant_id',
        'sale_id',
        'method',
        'amount',
        'reference_no',
        'remarks',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }
}