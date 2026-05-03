<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Plan;

class Product extends Model
{
    protected $fillable = [
        'product_code',
        'name',
        'description',
        'thumbnail',
        'price',
        'pricing_type',
        'status',
    ];

    public function images()
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function features()
    {
        return $this->hasMany(ProductFeature::class)->orderBy('sort_order');
    }

    public function overviews()
    {
        return $this->hasMany(ProductOverview::class)->orderBy('sort_order');
    }

    public function plans()
    {
        return $this->hasMany(Plan::class);
    }
}