<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductFeature extends Model
{
    protected $table = 'product_features';

    protected $fillable = [
        'product_id',
        'feature_title',
        'feature_description',
        'icon',
        'sort_order',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}