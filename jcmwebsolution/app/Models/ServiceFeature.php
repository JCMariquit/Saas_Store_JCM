<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceFeature extends Model
{
    protected $fillable = [
        'service_id',
        'feature_title',
        'feature_description',
        'icon',
        'sort_order',
    ];

    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}