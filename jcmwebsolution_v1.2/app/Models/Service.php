<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $fillable = [
        'code',
        'name',
        'description',
        'thumbnail',
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

    public function images()
    {
        return $this->hasMany(ServiceImage::class)->orderBy('sort_order');
    }

    public function features()
    {
        return $this->hasMany(ServiceFeature::class)->orderBy('sort_order');
    }

    public function overviews()
    {
        return $this->hasMany(ServiceOverview::class)->orderBy('sort_order');
    }
}