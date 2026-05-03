<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    protected $fillable = [
        'product_id',
        'name',
        'price',
        'description',
        'status',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}