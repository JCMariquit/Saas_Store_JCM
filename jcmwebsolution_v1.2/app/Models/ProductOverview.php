<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductOverview extends Model
{
    protected $table = 'product_overview';

    protected $fillable = [
        'product_id',
        'title',
        'content',
        'sort_order',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}