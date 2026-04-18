<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'product_code',
        'name',
        'description',
        'price',
        'pricing_type',
        'status',
    ];

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }
}