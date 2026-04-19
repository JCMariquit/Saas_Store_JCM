<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    protected $fillable = [
        'product_id',
        'plan_name',
        'price',
        'duration_days',
        'description',
        'status',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}