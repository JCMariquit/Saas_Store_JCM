<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;

    protected $table = 'services';

    protected $fillable = [
        'code',
        'name',
        'description',
        'service_type',
        'pricing_type',
        'base_price',
        'status',
        'sort_order',
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'sort_order' => 'integer',
    ];

    public function getBasePriceLabelAttribute(): string
    {
        if ($this->pricing_type === 'quote') {
            return 'Custom Quote';
        }

        return $this->base_price !== null
            ? '₱' . number_format((float) $this->base_price, 2)
            : 'Not set';
    }
}